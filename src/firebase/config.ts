import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const rawApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const rawAuthDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
const rawProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();
const rawStorageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim();
const rawMessagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim();
const rawAppId = (import.meta.env.VITE_FIREBASE_APP_ID || '').trim();

export const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: rawAuthDomain,
  projectId: rawProjectId,
  storageBucket: rawStorageBucket,
  messagingSenderId: rawMessagingSenderId,
  appId: rawAppId,
};

export function getMissingFirebaseKeys(): string[] {
  const missing: string[] = [];
  if (!rawApiKey || rawApiKey === 'YOUR_API_KEY') missing.push('VITE_FIREBASE_API_KEY');
  if (!rawAuthDomain || rawAuthDomain.includes('YOUR_PROJECT_ID')) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!rawProjectId || rawProjectId === 'YOUR_PROJECT_ID') missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!rawStorageBucket || rawStorageBucket.includes('YOUR_PROJECT_ID')) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!rawMessagingSenderId || rawMessagingSenderId === 'YOUR_MESSAGING_SENDER_ID') missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!rawAppId || rawAppId === 'YOUR_APP_ID') missing.push('VITE_FIREBASE_APP_ID');
  return missing;
}

// Check if credentials are provided and not default placeholders
export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawApiKey !== 'YOUR_API_KEY' &&
  rawApiKey !== 'undefined' &&
  rawProjectId &&
  rawProjectId !== 'YOUR_PROJECT_ID' &&
  rawProjectId !== 'undefined'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Failed to initialize Firebase App/Auth:', error);
  }
}

export { app, auth, db, storage };
