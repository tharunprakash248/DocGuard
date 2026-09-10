import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createDocumentRecord } from '../firebase/documentService';
import { DocumentCategory } from '../types/document';
import { CATEGORIES } from '../constants/categories';
import { formatFileSize, getFileTypeInfo } from '../utils/formatters';
import {
  UploadCloud,
  FileText,
  FileImage,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  ArrowLeft
} from 'lucide-react';

export const UploadDocument: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Metadata form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Identity');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [noExpiry, setNoExpiry] = useState(false);
  const [notes, setNotes] = useState('');

  // Upload status state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const handleFileSelect = (file: File) => {
    // Validate file type
    const isAllowed = ALLOWED_TYPES.includes(file.type) ||
      /\.(pdf|jpg|jpeg|png)$/i.test(file.name);

    if (!isAllowed) {
      setFormError('Invalid file type. Please upload a PDF, JPG, JPEG, or PNG file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormError('File exceeds the 25MB size limit.');
      return;
    }

    setFormError(null);
    setSelectedFile(file);

    // Auto-prefill document name if title is empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      // Capitalize words
      const capitalized = cleanName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setTitle(capitalized);
    }

    // Generate local preview if image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toastError('Authentication required', 'Please sign in to upload documents.');
      return;
    }

    if (!selectedFile) {
      setFormError('Please select a document file to upload.');
      return;
    }

    if (!title.trim()) {
      setFormError('Please provide a document title.');
      return;
    }

    if (!issueDate) {
      setFormError('Please specify the issue date.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setFormError(null);

    try {
      await createDocumentRecord(
        user.uid,
        {
          title: title.trim(),
          category,
          issueDate,
          expiryDate: noExpiry ? null : (expiryDate || null),
          notes: notes.trim(),
          file: selectedFile
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      success('Document Uploaded', `"${title.trim()}" has been securely stored.`);
      navigate('/documents');
    } catch (err: any) {
      console.error('Upload error:', err);
      setFormError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile.type || selectedFile.name) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Title & Back link */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Upload New Document
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Store and protect your important certificates, licenses, and personal documents.
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">{formError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Zone */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Document File <span className="text-rose-500">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
              }`}
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-800 text-base">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, JPG, JPEG, or PNG (up to 25 MB)
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${fileInfo?.bgColor} ${fileInfo?.color} border ${fileInfo?.borderColor}`}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : fileInfo?.type === 'pdf' ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <FileImage className="w-6 h-6" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {formatFileSize(selectedFile.size)} • {fileInfo?.label}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearSelectedFile}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Metadata Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            Document Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Document Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Passport, Driver's License, Health Insurance 2026"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
              />
            </div>

            {/* Expiry Date with No Expiry Checkbox */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Expiry Date
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={noExpiry}
                    onChange={(e) => {
                      setNoExpiry(e.target.checked);
                      if (e.target.checked) setExpiryDate('');
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>This document does not expire</span>
                </label>
              </div>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={noExpiry}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                DocGuard will notify you 30 days before this date.
              </p>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notes & Remarks (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Policy numbers, issuer details, renewal contacts, etc."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Encrypting and uploading to cloud storage...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit & Cancel Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Upload & Save Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
