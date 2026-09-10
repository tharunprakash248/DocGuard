import React from 'react';
import { DocumentItem } from '../../types/document';
import { calculateExpiryStatus } from '../../utils/expiry';
import { formatDate, formatFileSize, getFileTypeInfo } from '../../utils/formatters';
import { StatusBadge, CategoryBadge } from '../common/Badge';
import {
  FileText,
  FileImage,
  Eye,
  Download,
  Edit2,
  Trash2,
  Calendar,
  Clock
} from 'lucide-react';

interface DocumentCardProps {
  document: DocumentItem;
  onView: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onEdit,
  onDelete,
  onDownload
}) => {
  const expiry = calculateExpiryStatus(document.expiryDate);
  const fileInfo = getFileTypeInfo(document.fileType || document.fileName);
  const isImage = fileInfo.type === 'jpg' || fileInfo.type === 'png';

  return (
    // Removed overflow-hidden so the action footer is never clipped
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Card Body */}
      <div className="p-4 sm:p-5 pb-3 flex-1">
        {/* Top Header: Icon + Title + Quick-view */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* File Icon */}
            <div
              onClick={() => onView(document)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition transform group-hover:scale-105 ${fileInfo.bgColor} ${fileInfo.color} border ${fileInfo.borderColor}`}
            >
              {isImage ? (
                <FileImage className="w-6 h-6" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3
                onClick={() => onView(document)}
                title={document.title}
                className="font-bold text-slate-900 text-sm sm:text-base truncate cursor-pointer hover:text-blue-600 transition"
              >
                {document.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-mono">
                  {fileInfo.label} • {formatFileSize(document.fileSize)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick View Icon Button */}
          <button
            onClick={() => onView(document)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
            title="Quick Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Category & Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <CategoryBadge category={document.category} size="sm" />
          <StatusBadge status={expiry.status} size="sm" />
        </div>

        {/* Notes (if present) */}
        {document.notes && (
          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2 mb-3">
            {document.notes}
          </p>
        )}

        {/* Date grid */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5" /> Uploaded:
            </span>
            <span className="font-medium text-slate-700">
              {formatDate(document.createdAt.split('T')[0])}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5" /> Expiry:
            </span>
            <span className="font-medium text-slate-700">
              {document.expiryDate ? formatDate(document.expiryDate) : 'No Expiry'}
            </span>
          </div>

          {/* Remaining days badge */}
          <div className="pt-1">
            <span
              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${expiry.colorClass}`}
            >
              {expiry.label}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer — always fully visible, never clipped */}
      <div className="px-3 py-3 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl flex items-center gap-1.5">
        {/* View — grows to fill available space */}
        <button
          onClick={() => onView(document)}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 px-1 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-white transition border border-transparent hover:border-slate-200 whitespace-nowrap min-w-0"
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">View</span>
        </button>

        {/* Download — grows to fill available space */}
        <button
          onClick={() => onDownload(document)}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 px-1 rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-white transition border border-transparent hover:border-slate-200 whitespace-nowrap min-w-0"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Download</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Edit — fixed icon button */}
        <button
          onClick={() => onEdit(document)}
          className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-white transition border border-transparent hover:border-slate-200 shrink-0"
          title="Edit document"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Delete — fixed icon button */}
        <button
          onClick={() => onDelete(document)}
          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition border border-transparent hover:border-slate-200 shrink-0"
          title="Delete document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
