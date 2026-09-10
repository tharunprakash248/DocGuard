import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  fetchUserDocuments,
  updateUserDocument,
  deleteUserDocument
} from '../firebase/documentService';
import { DocumentItem, DocumentCategory } from '../types/document';
import { calculateExpiryStatus } from '../utils/expiry';
import { CATEGORIES } from '../constants/categories';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentTableRow } from '../components/documents/DocumentTableRow';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { DocumentEditModal } from '../components/documents/DocumentEditModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/documents/EmptyState';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Loader2,
  X,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

export const MyDocuments: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [selectedFileType, setSelectedFileType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'expirySoonest' | 'oldest' | 'nameAsc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync with URL query parameters if they change
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  const loadDocuments = async () => {
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
    loadDocuments();
  }, [user]);

  // Real-time Instant Search & Filter calculation
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Instant Search query: matches Document name, Category, or File type
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (doc.title || '').toLowerCase().includes(query);
        const matchesCategory = (doc.category || '').toLowerCase().includes(query);
        const matchesFileName = (doc.fileName || '').toLowerCase().includes(query);
        const matchesType = (doc.fileType || '').toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesFileName && !matchesType) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'All' && doc.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 3. File Type Filter (PDF, JPG, JPEG, PNG)
      if (selectedFileType !== 'All') {
        const typeStr = (doc.fileType || doc.fileName || '').toLowerCase();
        if (selectedFileType === 'pdf' && !typeStr.includes('pdf')) return false;
        if (selectedFileType === 'jpg' && !typeStr.includes('jpg') && !typeStr.includes('jpeg')) return false;
        if (selectedFileType === 'png' && !typeStr.includes('png')) return false;
      }

      // 4. Expiry Status Filter (Valid, Expiring Soon, Expired, No Expiry)
      if (selectedStatus !== 'All') {
        const exp = calculateExpiryStatus(doc.expiryDate);
        if (selectedStatus === 'valid' && exp.status !== 'valid') return false;
        if (selectedStatus === 'expiring_soon' && exp.status !== 'expiring_soon') return false;
        if (selectedStatus === 'expired' && exp.status !== 'expired') return false;
        if (selectedStatus === 'no_expiry' && exp.status !== 'no_expiry') return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'nameAsc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'expirySoonest') {
        // Documents with expiry come first, sorted by days remaining
        const aExp = calculateExpiryStatus(a.expiryDate);
        const bExp = calculateExpiryStatus(b.expiryDate);
        if (aExp.daysRemaining === null && bExp.daysRemaining === null) return 0;
        if (aExp.daysRemaining === null) return 1;
        if (bExp.daysRemaining === null) return -1;
        return aExp.daysRemaining - bExp.daysRemaining;
      }
      return 0;
    });
  }, [documents, searchQuery, selectedCategory, selectedFileType, selectedStatus, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedFileType('All');
    setSelectedStatus('All');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedFileType !== 'All' ||
    selectedStatus !== 'All';

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
      success('Firestore Record', `"${doc.title}" metadata is saved in Firestore.`);
    }
  };

  const handleSaveEdit = async (docId: string, updates: Partial<DocumentItem>) => {
    if (!user) return;
    await updateUserDocument(docId, user.uid, updates);
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, ...updates } : d))
    );
    success('Document updated', 'Changes have been saved successfully.');
  };

  const handleConfirmDelete = async () => {
    if (!deleteDoc || !user) return;
    try {
      setIsDeleting(true);
      await deleteUserDocument(deleteDoc.id, user.uid, deleteDoc.storagePath);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteDoc.id));
      success('Document deleted', `"${deleteDoc.title}" has been deleted.`);
      setDeleteDoc(null);
    } catch (err: any) {
      toastError('Delete failed', err.message || 'Could not delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, manage, and monitor all your stored cloud documents.
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

      {/* Prominent Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Instant search by document name, category, or file type (e.g. passport, license, pdf)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 focus:bg-white text-sm sm:text-base rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                File Type:
              </span>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Formats</option>
                <option value="pdf">PDF Documents</option>
                <option value="jpg">JPG / JPEG Images</option>
                <option value="png">PNG Images</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="valid">Valid (&gt; 30 days)</option>
                <option value="expiring_soon">Expiring Soon (≤ 30 days)</option>
                <option value="expired">Expired</option>
                <option value="no_expiry">No Expiry Date</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right side: Sort By & View Mode Toggle */}
          <div className="flex items-center gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="expirySoonest">Sort: Expiry Soonest</option>
                <option value="nameAsc">Sort: Name (A to Z)</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>
            </div>

            {/* View Mode (Grid vs Table) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Active Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredDocuments.length}</strong> of{' '}
          <strong>{documents.length}</strong> documents
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading documents...</span>
          </div>
        </div>
      )}

      {/* Empty State: Zero documents in vault */}
      {!loading && documents.length === 0 && (
        <EmptyState
          type="no_documents"
          title="No documents uploaded yet"
          description="Secure your personal documents in the cloud to access them anytime and track expiry dates."
        />
      )}

      {/* Empty State: Filters produced zero matches */}
      {!loading && documents.length > 0 && filteredDocuments.length === 0 && (
        <EmptyState
          type="no_search_results"
          title="No documents match your query"
          description="Try broadening your search term or resetting the active filters."
          onResetFilters={handleClearFilters}
        />
      )}

      {/* Documents Grid View */}
      {!loading && filteredDocuments.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredDocuments.map((doc) => (
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
      )}

      {/* Documents Table View */}
      {!loading && filteredDocuments.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                  <th className="py-3 px-4 hidden md:table-cell">Upload Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => (
                  <DocumentTableRow
                    key={doc.id}
                    document={doc}
                    onView={(d) => setPreviewDoc(d)}
                    onEdit={(d) => setEditDoc(d)}
                    onDelete={(d) => setDeleteDoc(d)}
                    onDownload={handleDownload}
                  />
                ))}
              </tbody>
            </table>
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
        message={`Are you sure you want to delete "${deleteDoc?.title}"? This permanently deletes the file from Cloud Storage and cannot be undone.`}
        confirmText="Delete Document"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};
