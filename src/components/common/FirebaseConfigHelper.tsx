import React, { useState } from 'react';
import { KeyRound, Check, Copy, ExternalLink, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase/config';

export const FirebaseConfigBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isFirebaseConfigured) {
    return null;
  }

  const envTemplate = `# DocGuard Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 text-amber-900 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-amber-900 text-sm sm:text-base">
                Firebase Setup Needed for Live Cloud Storage & Auth
              </h4>
              <span className="px-2 py-0.5 text-xs bg-amber-200/80 text-amber-900 font-semibold rounded-md">
                Local Vault Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
              DocGuard is currently using an in-browser local vault so you can test all features right away. To sync your documents to your own Google Cloud Firebase project, add your credentials to the <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs text-amber-900">.env</code> file.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-700 transition shrink-0"
          title="Toggle details"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-amber-200/70 text-xs sm:text-sm text-amber-900">
          <h5 className="font-bold mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Quick 3-Minute Firebase Setup Guide:
          </h5>
          <ol className="list-decimal list-inside space-y-1.5 text-amber-800 mb-4 pl-1">
            <li>
              Go to the{' '}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold text-blue-700 inline-flex items-center gap-1 hover:text-blue-800"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and click <strong>Add Project</strong>.
            </li>
            <li>
              Under <strong>Build</strong>, enable:
              <ul className="list-disc list-inside ml-5 mt-1 space-y-0.5">
                <li><strong>Authentication</strong>: Enable Email/Password provider.</li>
                <li><strong>Firestore Database</strong>: Create database (Start in test mode or paste rules).</li>
                <li><strong>Storage</strong>: Get Started (Start in test mode or paste rules).</li>
              </ul>
            </li>
            <li>
              In <strong>Project Settings</strong> under <em>Your apps</em>, click the Web icon (<code className="font-mono text-xs">&lt;/&gt;</code>) to register the app.
            </li>
            <li>Copy the configuration keys into your project's <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file.</li>
          </ol>

          <div className="relative bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-xs overflow-x-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700 text-slate-400">
              <span>Required .env variables:</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied template!' : 'Copy template'}</span>
              </button>
            </div>
            <pre>{envTemplate}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
