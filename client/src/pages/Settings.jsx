import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Bell,
  Sparkles,
  Save,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user, updatePreferences } = useAuthStore();

  const [defaultReplyTone, setDefaultReplyTone] = useState(
    user?.preferences?.defaultReplyTone || 'Professional'
  );
  const [aiModel, setAiModel] = useState(user?.preferences?.aiModel || 'auto');
  const [autoClassify, setAutoClassify] = useState(
    user?.preferences?.autoClassify ?? true
  );
  const [notifications, setNotifications] = useState(
    user?.preferences?.notifications ?? true
  );
  const [smtpUser, setSmtpUser] = useState(user?.preferences?.smtp?.user || '');
  const [smtpPass, setSmtpPass] = useState(user?.preferences?.smtp?.pass || '');
  const [smtpHost, setSmtpHost] = useState(user?.preferences?.smtp?.host || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(user?.preferences?.smtp?.port || 587);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updatePreferences({
        defaultReplyTone,
        aiModel,
        autoClassify,
        notifications,
        smtp: {
          user: smtpUser,
          pass: smtpPass,
          host: smtpHost,
          port: Number(smtpPort) || 587,
          isEnabled: !!(smtpUser && smtpPass),
        },
      });
      toast.success('Preferences & SMTP credentials saved!');
    } catch (err) {
      toast.error('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              Settings & AI Preferences
            </h1>
            <p className="text-xs text-slate-500">
              Customize your profile, default reply tones, and AI models
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                Profile Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 opacity-80 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 opacity-80 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* AI Customization Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ai-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                AI Tone & Engine Preferences
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Default AI Reply Tone
                </label>
                <select
                  value={defaultReplyTone}
                  onChange={(e) => setDefaultReplyTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
                >
                  <option value="Professional">Professional (Corporate & clear)</option>
                  <option value="Friendly">Friendly (Warm & engaging)</option>
                  <option value="Formal">Formal (Executive & polished)</option>
                  <option value="Concise">Concise (Short & direct)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default tone used when opening the AI reply generator.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Primary AI Model
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
                >
                  <option value="auto">Auto Selection (OpenAI GPT-4o with Gemini Fallback)</option>
                  <option value="openai">OpenAI GPT-4o-mini (Primary)</option>
                  <option value="gemini">Google Gemini 1.5 Flash</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Switches automatically to active API key or deterministic engine.
                </p>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Background AI Email Classification
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Automatically classify inbox items into Work, Finance, Promotions, and Priority.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoClassify}
                  onChange={(e) => setAutoClassify(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Real-Time Push Notifications
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Receive immediate live notifications when AI completes analysis or emails are sent.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Real-World Email Dispatch (SMTP / Gmail App Password) Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                  Real Email Dispatch (Gmail / SMTP Delivery)
                </h2>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                Live External Mailbox Delivery
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your Gmail App Password or custom SMTP server so your sent emails are delivered directly to the recipient's real-world inbox over the internet.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Sender Email (e.g. your Gmail)
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Gmail App Password / SMTP Password
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="16-character app password"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Google Account → Security → 2-Step Verification → App passwords.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
