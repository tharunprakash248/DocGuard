import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured, firebaseConfig } from '../firebase/config';
import {
  User,
  Shield,
  KeyRound,
  FileCode,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Lock,
  Database,
  Cloud
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, isDemoUser } = useAuth();
  const [copiedRules, setCopiedRules] = useState<string | null>(null);

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{documentId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

  const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{userId}/{allPaths=**} {
      // Only the authenticated document owner can read, write, and delete their files
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRules(label);
    setTimeout(() => setCopiedRules(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Cloud Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account profile, check Firebase cloud connection, and review security rules.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {user?.displayName || 'User Profile'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            {isDemoUser && (
              <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                Demo Account Mode
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">User Identifier (UID):</span>
            <p className="font-mono text-slate-700 font-semibold mt-1 truncate">{user?.uid}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Authentication Source:</span>
            <p className="font-semibold text-slate-700 mt-1">
              {isFirebaseConfigured ? 'Firebase Authentication' : 'Local Vault Session'}
            </p>
          </div>
        </div>
      </div>

      {/* Firebase Cloud Connection Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isFirebaseConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Firebase Cloud Integration Status
              </h3>
              <p className="text-xs text-slate-500">
                {isFirebaseConfigured
                  ? 'Connected to Google Firebase Cloud Services'
                  : 'Pending configuration via environment variables in .env'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isFirebaseConfigured
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isFirebaseConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Inactive (.env)
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-semibold mb-1">
              <span>Authentication</span>
              <Lock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-slate-500">
              {isFirebaseConfigured ? 'Firebase Auth' : 'Local Auth'}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-semibold mb-1">
              <span>Database</span>
              <Database className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-slate-500">
              {isFirebaseConfigured ? 'Cloud Firestore' : 'Browser Storage'}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-semibold mb-1">
              <span>File Storage</span>
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-slate-500">
              {isFirebaseConfigured ? 'Firebase Cloud Storage' : 'Blob Object URLs'}
            </p>
          </div>
        </div>
      </div>

      {/* Security Rules Reference */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Production Security Rules
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            DocGuard enforces multi-tenant document privacy. Paste these rules into your Firebase Console to prevent any user from viewing or downloading another user's documents.
          </p>
        </div>

        {/* Firestore Rules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Firestore Security Rules (firestore.rules)
            </span>
            <button
              onClick={() => handleCopy(firestoreRules, 'firestore')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {copiedRules === 'firestore' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Rules
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto">
            {firestoreRules}
          </pre>
        </div>

        {/* Storage Rules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Firebase Storage Security Rules (storage.rules)
            </span>
            <button
              onClick={() => handleCopy(storageRules, 'storage')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {copiedRules === 'storage' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Rules
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto">
            {storageRules}
          </pre>
        </div>
      </div>
    </div>
  );
};
