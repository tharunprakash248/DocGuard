import React from 'react';
import { Menu, Plus, Shield, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  searchQuery = '',
  onSearchChange
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/documents?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Hamburger & Brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">DocGuard</span>
        </Link>
      </div>

      {/* Global Quick Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search documents (e.g. passport, insurance)..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Document</span>
          <span className="sm:hidden">Upload</span>
        </Link>

        {/* User initials circle */}
        <Link
          to="/settings"
          className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-blue-400 transition"
          title="Account Settings"
        >
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
        </Link>
      </div>
    </header>
  );
};
