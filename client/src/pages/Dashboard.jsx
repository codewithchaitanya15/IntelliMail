import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Star,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bot,
  Activity,
  Calendar,
} from 'lucide-react';
import { useEmailStore } from '../store/emailStore.js';
import { useAuthStore } from '../store/authStore.js';
import { EmailCard } from '../components/EmailCard/EmailCard.jsx';
import { PriorityBadge, CategoryBadge } from '../components/PriorityBadge/PriorityBadge.jsx';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { emails, stats, fetchEmails, isLoading } = useEmailStore();

  useEffect(() => {
    fetchEmails('inbox');
  }, []);

  const highPriorityEmails = emails.filter((e) => e.priority === 'HIGH');
  const recentEmails = emails.slice(0, 5);

  const categories = ['Work', 'Finance', 'Personal', 'Important', 'Promotions'];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = emails.filter((e) => e.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-brand-600 via-indigo-600 to-ai-600 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-white mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant Active & Synchronized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Good day, {user?.name || 'there'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
            You have <span className="font-bold text-white">{stats.unreadCount} unread emails</span> and{' '}
            <span className="font-bold text-white">{stats.highPriorityCount} high-priority tasks</span> requiring your attention today.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unread Messages</span>
            <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
              {stats.unreadCount}
            </h3>
            <Link to="/inbox" className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline mt-1 inline-block">
              View unread inbox →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">High Priority</span>
            <h3 className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400 mt-1">
              {stats.highPriorityCount}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">Urgent deadlines detected</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Starred Emails</span>
            <h3 className="text-2xl font-bold font-display text-amber-500 mt-1">
              {stats.starredCount}
            </h3>
            <Link to="/starred" className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline mt-1 inline-block">
              View starred items →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gmail Status</span>
            <h3 className="text-base font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
              {user?.isDemoMode ? 'Demo Sandbox' : user?.gmailConnected ? 'Connected' : 'Disconnected'}
            </h3>
            <Link to="/integrations" className="text-[11px] text-slate-400 hover:underline mt-1 inline-block">
              Manage connection →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: High Priority Attention + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Priority Items & Recent Emails */}
        <div className="lg:col-span-2 space-y-6">
          {/* High Priority Attention Section */}
          <div className="rounded-3xl border border-rose-200/60 dark:border-rose-900/40 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                  Urgent & High Priority Action Needed
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {highPriorityEmails.length} Items
              </span>
            </div>

            {highPriorityEmails.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No urgent or high priority emails pending.</p>
            ) : (
              <div className="space-y-3">
                {highPriorityEmails.map((email) => (
                  <Link
                    key={email.id}
                    to={`/email/${email.id}`}
                    className="block p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
                        {email.subject}
                      </span>
                      <PriorityBadge priority="HIGH" size="xs" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {email.snippet}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Inbox Emails */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-brand-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                  Recent Inbox Activity
                </h2>
              </div>
              <Link to="/inbox" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                View all inbox →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {recentEmails.map((email) => (
                <EmailCard key={email.id} email={email} />
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Classification Breakdown + Quick Assistant Tools */}
        <div className="space-y-6">
          {/* AI Category Distribution */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-ai-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                AI Category Breakdown
              </h2>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const percent = emails.length > 0 ? Math.round((count / emails.length) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="text-slate-400 font-mono">{count} emails ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-ai-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick AI Shortcuts */}
          <div className="rounded-3xl border border-ai-200/80 dark:border-ai-900/60 bg-gradient-to-br from-ai-50/60 via-white to-transparent dark:from-ai-950/30 dark:via-slate-900 dark:to-transparent p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ai-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                AI Capabilities Ready
              </h2>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>One-click thread summarization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Professional, Formal & Friendly reply drafting</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Action-item checklist extraction</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Natural language smart email search</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
