import React from 'react';
import { FileQuestion, Upload, Search, FilterX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  type: 'no_documents' | 'no_search_results' | 'no_expiring' | 'category_empty';
  title?: string;
  description?: string;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  onResetFilters
}) => {
  if (type === 'no_search_results') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
          <Search className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-800 text-base sm:text-lg">
          {title || 'No documents match your query'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
          {description || 'Try searching with a different term, category, or clear your applied filters.'}
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <FilterX className="w-4 h-4" /> Clear All Filters
          </button>
        )}
      </div>
    );
  }

  if (type === 'no_expiring') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2">
          <FileQuestion className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm">No Upcoming Expirations</h4>
        <p className="text-xs text-slate-500 mt-0.5">
          None of your documents are expiring within the next 30 days. You're all clear!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
        <Upload className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-slate-800 text-lg">
        {title || 'No documents uploaded yet'}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
        {description || 'Store your passport, driving license, insurance policies, certificates, and more securely in the cloud.'}
      </p>
      <Link
        to="/upload"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition transform hover:-translate-y-0.5"
      >
        <Upload className="w-4 h-4" /> Upload First Document
      </Link>
    </div>
  );
};
