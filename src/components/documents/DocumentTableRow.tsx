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
  Trash2
} from 'lucide-react';

interface DocumentTableRowProps {
  document: DocumentItem;
  onView: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
}

export const DocumentTableRow: React.FC<DocumentTableRowProps> = ({
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
    <tr className="hover:bg-slate-50/80 transition border-b border-slate-100 last:border-0 group">
      {/* Name & Type */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onView(document)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 cursor-pointer ${fileInfo.bgColor} ${fileInfo.color} border ${fileInfo.borderColor}`}
          >
            {isImage ? (
              <FileImage className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0 max-w-xs sm:max-w-md">
            <p
              onClick={() => onView(document)}
              className="font-semibold text-slate-800 text-sm truncate hover:text-blue-600 cursor-pointer"
            >
              {document.title}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {document.fileName} • {formatFileSize(document.fileSize)}
            </p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3.5 px-4 hidden sm:table-cell">
        <CategoryBadge category={document.category} size="sm" />
      </td>

      {/* Upload Date */}
      <td className="py-3.5 px-4 text-xs text-slate-600 hidden md:table-cell">
        {formatDate(document.createdAt.split('T')[0])}
      </td>

      {/* Expiry Date & Remaining */}
      <td className="py-3.5 px-4">
        <div className="text-xs">
          <p className="font-medium text-slate-700">
            {document.expiryDate ? formatDate(document.expiryDate) : 'No Expiry'}
          </p>
          <span className={`inline-block text-[11px] font-semibold mt-0.5 px-1.5 py-0.2 rounded ${expiry.colorClass}`}>
            {expiry.label}
          </span>
        </div>
      </td>

      {/* Status Badge */}
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <StatusBadge status={expiry.status} size="sm" />
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(document)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDownload(document)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(document)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(document)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
