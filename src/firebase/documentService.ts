import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { DocumentItem, DocumentCategory } from '../types/document';

const COLLECTION_NAME = 'documents';
const LOCAL_STORAGE_DOCS_KEY = 'docguard_local_documents_v1';

// Helper for local storage fallback if Firestore is temporarily offline or unauthenticated
function getLocalDocuments(userId: string): DocumentItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
    if (!raw) return [];
    const allDocs: DocumentItem[] = JSON.parse(raw);
    return allDocs.filter(d => d.userId === userId);
  } catch {
    return [];
  }
}

function saveLocalDocuments(docs: DocumentItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(docs));
  } catch (e) {
    console.warn('Could not save to local storage', e);
  }
}

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

export interface CreateDocumentInput {
  title: string;
  category: DocumentCategory;
  issueDate: string;
  expiryDate?: string | null;
  notes?: string;
  file: File;
}

/**
 * Creates a document record in Cloud Firestore.
 * Note: Keeping on Firebase Spark no-cost plan: stores rich document metadata
 * in Firestore directly, and maintains local Object URLs for instant viewing.
 * Architecture is prepared for Firebase Storage upload URL connection later.
 */
export async function createDocumentRecord(
  userId: string,
  input: CreateDocumentInput,
  onProgress?: UploadProgressCallback
): Promise<DocumentItem> {
  if (onProgress) onProgress(30);

  // Generate an Object URL for instant in-session preview without paid cloud storage
  const previewUrl = URL.createObjectURL(input.file);
  if (onProgress) onProgress(60);

  const docTitle = input.title.trim() || input.file.name;

  const newDocData = {
    userId,
    documentName: docTitle,
    title: docTitle,
    category: input.category,
    issueDate: input.issueDate,
    expiryDate: input.expiryDate || null,
    notes: input.notes?.trim() || '',
    fileName: input.file.name,
    fileType: input.file.type || 'application/octet-stream',
    fileSize: input.file.size,
    fileUrl: previewUrl,
    storagePath: '', // Reserved for future Firebase Cloud Storage integration
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!isFirebaseConfigured || !db) {
    const localId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const created: DocumentItem = { id: localId, ...newDocData };
    const all = getLocalDocuments(userId);
    all.unshift(created);
    saveLocalDocuments(all);
    if (onProgress) onProgress(100);
    return created;
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...newDocData,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp()
    });

    if (onProgress) onProgress(100);

    return {
      id: docRef.id,
      ...newDocData
    };
  } catch (error: any) {
    console.error('Firestore addDoc error:', error);
    if (error.code === 'permission-denied') {
      throw new Error(
        'Firestore permission denied. Please publish your Firestore Security Rules in Firebase Console > Firestore Database > Rules.'
      );
    }
    throw error;
  }
}

/**
 * Fetches user-specific documents from Cloud Firestore.
 * Strictly queries documents where userId == current authenticated userId.
 */
export async function fetchUserDocuments(userId: string): Promise<DocumentItem[]> {
  if (!isFirebaseConfigured || !db) {
    return getLocalDocuments(userId);
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const results: DocumentItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docName = data.documentName || data.title || '';
      results.push({
        id: docSnap.id,
        userId: data.userId,
        documentName: docName,
        title: docName,
        category: data.category || 'Other',
        issueDate: data.issueDate || '',
        expiryDate: data.expiryDate || null,
        notes: data.notes || '',
        fileUrl: data.fileUrl || '',
        storagePath: data.storagePath || '',
        fileName: data.fileName || '',
        fileType: data.fileType || '',
        fileSize: Number(data.fileSize) || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      });
    });

    // Sort newest first client-side (avoids requiring a composite Firestore index)
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  } catch (error: any) {
    console.error('Error fetching documents from Firestore:', error);
    if (error.code === 'permission-denied') {
      throw new Error(
        'Firestore permission denied. Please verify your Firestore rules in Firebase Console > Firestore Database > Rules tab.'
      );
    }
    throw error;
  }
}

/**
 * Updates a document record in Cloud Firestore.
 */
export async function updateUserDocument(
  docId: string,
  userId: string,
  updates: Partial<Pick<DocumentItem, 'title' | 'documentName' | 'category' | 'issueDate' | 'expiryDate' | 'notes'>>
): Promise<void> {
  const docName = updates.documentName || updates.title;
  const payload: any = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  if (docName) {
    payload.documentName = docName;
    payload.title = docName;
  }

  if (!isFirebaseConfigured || !db) {
    const all = getLocalDocuments(userId);
    const idx = all.findIndex(d => d.id === docId && d.userId === userId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...payload };
      saveLocalDocuments(all);
    }
    return;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(docRef, {
      ...payload,
      serverUpdatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Error updating document in Firestore:', error);
    if (error.code === 'permission-denied') {
      throw new Error(
        'Permission denied: You do not have permission to update this document in Firestore.'
      );
    }
    throw error;
  }
}

/**
 * Deletes a document record from Cloud Firestore.
 */
export async function deleteUserDocument(
  docId: string,
  userId: string,
  storagePath?: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const all = getLocalDocuments(userId);
    const filtered = all.filter(d => !(d.id === docId && d.userId === userId));
    saveLocalDocuments(filtered);
    return;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Error deleting document from Firestore:', error);
    if (error.code === 'permission-denied') {
      throw new Error(
        'Permission denied: You do not have permission to delete this document in Firestore.'
      );
    }
    throw error;
  }
}
