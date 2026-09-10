import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserDocuments } from '../firebase/documentService';
import { DocumentItem } from '../types/document';
import { CATEGORIES } from '../constants/categories';
import {
  UserCheck,
  GraduationCap,
  Award,
  FileBadge,
  ShieldCheck,
  CreditCard,
  HeartPulse,
  FileText,
  ArrowRight,
  Loader2,
  FolderOpen
} from 'lucide-react';

export const Categories: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        const docs = await fetchUserDocuments(user.uid);
        setDocuments(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Compute count for each category
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.name] = documents.filter(
      (d) => d.category.toLowerCase() === cat.name.toLowerCase()
    ).length;
    return acc;
  }, {} as Record<string, number>);

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'UserCheck': return <UserCheck className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Award': return <Award className={className} />;
      case 'FileBadge': return <FileBadge className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      default: return <FileText className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Document Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Organize and view all your documents sorted by their official classification.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading category statistics...</span>
          </div>
        </div>
      )}

      {/* Grid of 8 Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.name] || 0;
          return (
            <div
              key={cat.name}
              onClick={() => navigate(`/documents?category=${encodeURIComponent(cat.name)}`)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.bgColor} ${cat.textColor} border ${cat.borderColor} group-hover:scale-105 transition`}
                  >
                    {renderIcon(cat.iconName, 'w-6 h-6')}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {loading ? '—' : `${count} ${count === 1 ? 'doc' : 'docs'}`}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Browse {cat.name}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
