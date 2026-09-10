import React from 'react';
import { Modal } from '../common/Modal';
import { DocumentItem } from '../../types/document';
import { calculateExpiryStatus } from '../../utils/expiry';
import { formatDate, formatFileSize, getFileTypeInfo } from '../../utils/formatters';
import { StatusBadge, CategoryBadge } from '../common/Badge';
import {
  Download,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  Info,
  Layers
} from 'lucide-react';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: DocumentItem) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDownload
}) => {
  if (!document) return null;

  const expiry = calculateExpiryStatus(document.expiryDate);
  const fileInfo = getFileTypeInfo(document.fileType || document.fileName);
  const isImage = fileInfo.type === 'jpg' || fileInfo.type === 'png';
  const isPdf = fileInfo.type === 'pdf';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={document.title} maxWidth="4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Frame */}
        <div className="lg:col-span-2 bg-slate-950/5 rounded-2xl border border-slate-200 p-2 sm:p-4 flex items-center justify-center min-h-[320px] max-h-[500px] overflow-auto">
          {isImage ? (
            <img
              src={document.fileUrl}
              alt={document.title}
              className="max-h-[460px] w-auto max-w-full rounded-xl object-contain shadow-sm"
              onError={(e) => {
                // If local preview URL failed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : isPdf ? (
            <iframe
              src={`${document.fileUrl}#toolbar=0`}
              title={document.title}
              className="w-full h-[460px] rounded-xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <p className="font-semibold text-slate-800">{document.fileName}</p>
              <p className="text-xs text-slate-500 mt-1">Preview not supported directly in browser</p>
              <button
                onClick={() => onDownload(document)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                <Download className="w-4 h-4" /> Download to View
              </button>
            </div>
          )}
        </div>

        {/* Document Details & Metadata Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Document Details
              </span>
              <h3 className="font-bold text-slate-900 text-lg mt-0.5">{document.title}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{document.fileName}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={document.category} />
              <StatusBadge status={expiry.status} />
            </div>

            {/* Expiry Banner */}
            <div className={`p-3 rounded-xl border ${expiry.colorClass} text-xs font-semibold flex items-center gap-2`}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>{expiry.label}</span>
            </div>

            {/* Meta Grid */}
            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" /> Issue Date:
                </span>
                <span className="font-medium text-slate-800">{formatDate(document.issueDate)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> Expiry Date:
                </span>
                <span className="font-medium text-slate-800">
                  {document.expiryDate ? formatDate(document.expiryDate) : 'No Expiry'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Layers className="w-3.5 h-3.5" /> File Size:
                </span>
                <span className="font-medium text-slate-800">{formatFileSize(document.fileSize)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Info className="w-3.5 h-3.5" /> Format:
                </span>
                <span className="font-medium uppercase text-slate-800">{fileInfo.label}</span>
              </div>
            </div>

            {/* Notes */}
            {document.notes && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Notes
                </span>
                <p className="text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-xl mt-1 leading-relaxed whitespace-pre-wrap">
                  {document.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => onDownload(document)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Document
            </button>

            {document.fileUrl && (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
