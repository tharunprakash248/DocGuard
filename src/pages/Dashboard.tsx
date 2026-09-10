import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  fetchUserDocuments,
  updateUserDocument,
  deleteUserDocument
} from '../firebase/documentService';
import { DocumentItem } from '../types/document';
import { calculateExpiryStatus } from '../utils/expiry';
import { FirebaseConfigBanner } from '../components/common/FirebaseConfigHelper';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { DocumentEditModal } from '../components/documents/DocumentEditModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/documents/EmptyState';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  ArrowRight,
  Clock,
  Plus,
  Loader2,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const docs = await fetchUserDocuments(user.uid);
      setDocuments(docs);
    } catch (err: any) {
      toastError('Could not load documents', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [user]);

  // Expiry stats calculation
  const totalCount = documents.length;
  let validCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;

  const upcomingExpirations: { doc: DocumentItem; days: number; label: string }[] = [];

  documents.forEach((doc) => {
    const exp = calculateExpiryStatus(doc.expiryDate);
    if (exp.status === 'valid') validCount++;
    else if (exp.status === 'expiring_soon') {
      expiringSoonCount++;
      if (exp.daysRemaining !== null) {
        upcomingExpirations.push({
          doc,
          days: exp.daysRemaining,
          label: exp.label
        });
      }
    } else if (exp.status === 'expired') {
      expiredCount++;
    }
  });

  // Sort upcoming expirations by fewest days remaining first
  upcomingExpirations.sort((a, b) => a.days - b.days);

  // Recently uploaded documents (up to 4)
  const recentlyUploaded = documents.slice(0, 4);

  // Action handlers
  const handleDownload = (doc: DocumentItem) => {
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName || doc.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success('Download started', `Downloading ${doc.fileName}`);
    } else {
      success('Cloud Firestore Record', `"${doc.title}" metadata is active in Firestore.`);
    }
  };

  const handleSaveEdit = async (docId: string, updates: Partial<DocumentItem>) => {
    if (!user) return;
    await updateUserDocument(docId, user.uid, updates);
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, ...updates } : d))
    );
    success('Document updated', 'Changes have been saved.');
  };

  const handleConfirmDelete = async () => {
    if (!deleteDoc || !user) return;
    try {
      setIsDeleting(true);
      await deleteUserDocument(deleteDoc.id, user.uid, deleteDoc.storagePath);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteDoc.id));
      success('Document deleted', `"${deleteDoc.title}" has been removed.`);
      setDeleteDoc(null);
    } catch (err: any) {
      toastError('Delete failed', err.message || 'Could not delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Firebase Setup Helper Banner */}
      <FirebaseConfigBanner />

      {/* Greeting & Quick Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.displayName || 'User'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Overview of your protected cloud documents and expiry dates.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Documents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Documents
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {loading ? '—' : totalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Safely in cloud vault</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Valid Documents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Valid Documents
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {loading ? '—' : validCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">&gt; 30 days remaining</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Expiring Soon
            </p>
            <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
              {loading ? '—' : expiringSoonCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Within 30 days</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Expired Documents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Expired
            </p>
            <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">
              {loading ? '—' : expiredCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Action required</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading your vault documents...</span>
          </div>
        </div>
      )}

      {!loading && documents.length === 0 && (
        <EmptyState
          type="no_documents"
          title="Your document vault is currently empty"
          description="Start safeguarding your passport, driving license, insurance policies, and certificates in one central place."
        />
      )}

      {!loading && documents.length > 0 && (
        <div className="space-y-8">
          {/* Section: Upcoming Expirations (Within 30 days) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Upcoming Expirations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Documents expiring within the next 30 days requiring attention
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                {upcomingExpirations.length} urgent
              </span>
            </div>

            {upcomingExpirations.length === 0 ? (
              <EmptyState type="no_expiring" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingExpirations.map(({ doc, label }) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/40 hover:bg-amber-50/70 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                          {label}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {doc.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm truncate">{doc.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        Expires: {doc.expiryDate}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-amber-200/60">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Recently Uploaded Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Recently Uploaded Documents
                </h2>
                <p className="text-xs text-slate-500">
                  Latest files added to your personal cloud vault
                </p>
              </div>

              <Link
                to="/documents"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>View All ({documents.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyUploaded.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={(d) => setPreviewDoc(d)}
                  onEdit={(d) => setEditDoc(d)}
                  onDelete={(d) => setDeleteDoc(d)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />

      <DocumentEditModal
        document={editDoc}
        isOpen={Boolean(editDoc)}
        onClose={() => setEditDoc(null)}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteDoc)}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteDoc?.title}"? This action permanently removes both the metadata and the cloud storage file.`}
        confirmText="Delete Document"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};
