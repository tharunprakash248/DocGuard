import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  Upload,
  Grid,
  Settings,
  LogOut,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout, isDemoUser, isFirebaseConfigured } = useAuth();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'My Documents', icon: Files },
    { to: '/upload', label: 'Upload Document', icon: Upload },
    { to: '/categories', label: 'Categories', icon: Grid },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
              DocGuard
            </h1>
            <p className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase">
              Cloud Document Vault
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-slate-100">
        {/* Status Indicator */}
        <div className="mb-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Vault Storage:</span>
            <span className="font-semibold text-slate-800">
              {isFirebaseConfigured ? 'Cloud Sync' : 'Local Vault'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="text-[11px] text-slate-500 truncate">
              {isFirebaseConfigured ? 'Connected to Firebase' : 'Ready for .env credentials'}
            </span>
          </div>
        </div>

        {/* User Badge */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-slate-800 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.email || 'authenticated'}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
