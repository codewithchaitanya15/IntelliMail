import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  RotateCw,
  Unlink,
  Sparkles,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { gmailService } from '../services/gmail.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const Integrations = () => {
  const [searchParams] = useSearchParams();
  const { user, fetchMe } = useAuthStore();

  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const data = await gmailService.getStatus();
      setStatus(data);
    } catch (err) {
      console.warn('Fetch Gmail status failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Check query params if redirected back from Google OAuth
    if (searchParams.get('status') === 'connected') {
      toast.success('Gmail account connected successfully via Google OAuth 2.0!');
      fetchMe();
    } else if (searchParams.get('error')) {
      toast.error(`OAuth error: ${searchParams.get('error')}`);
    }
  }, []);

  const handleConnectOAuth = async () => {
    setIsConnecting(true);
    try {
      const url = await gmailService.getOAuthUrl();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      toast.error('Google OAuth credentials not configured on backend. Switching to Demo Mode or configure GOOGLE_CLIENT_ID.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await gmailService.disconnect();
      toast.success('Gmail account disconnected');
      fetchStatus();
      fetchMe();
    } catch (err) {
      toast.error('Failed to disconnect');
    }
  };

  const handleConnectDemo = async () => {
    try {
      await gmailService.connectDemo();
      toast.success('Switched to Demo Inbox Sandbox');
      fetchStatus();
      fetchMe();
    } catch (err) {
      toast.error('Failed to connect demo sandbox');
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              Integrations & OAuth 2.0
            </h1>
            <p className="text-xs text-slate-500">
              Connect real Gmail accounts securely or switch to simulated sandbox
            </p>
          </div>
        </div>

        {/* Main Gmail Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                    Gmail API (Google OAuth 2.0)
                  </h2>
                  {status?.isConnected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{status.isDemoMode ? 'Demo Sandbox Active' : 'Connected'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Disconnected</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Access inbox messages, view threads, send emails, and process summaries through Gmail.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {status?.isConnected ? (
                <>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                  <button
                    onClick={handleConnectOAuth}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                    <span>Reconnect Google</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConnectDemo}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Load Demo Sandbox
                  </button>
                  <button
                    onClick={handleConnectOAuth}
                    disabled={isConnecting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-glow-brand transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Connect Real Gmail</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Account Details if Connected */}
          {status?.isConnected && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Connected Email:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{status.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Token Encryption:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> AES-256-GCM Active
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Mode:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {status.isDemoMode ? 'Local Demo Sandbox' : 'Live Google OAuth 2.0'}
                </span>
              </div>
            </div>
          )}

          {/* Security Guarantee Box */}
          <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/60 space-y-2 text-xs">
            <h3 className="font-bold text-brand-900 dark:text-brand-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-500" /> OAuth 2.0 Security Architecture
            </h3>
            <ul className="text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc marker:text-brand-500 leading-relaxed">
              <li>We never request, handle, or store your Google account password.</li>
              <li>OAuth access and refresh tokens are encrypted at rest using an AES-256-GCM application key.</li>
              <li>AI summaries and replies are strictly requested upon user action and never sent without review.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
