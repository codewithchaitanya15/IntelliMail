import React, { useEffect, useState } from 'react';
import {
  Activity as ActivityIcon,
  Mail,
  Sparkles,
  Zap,
  CheckCircle,
  Clock,
  RotateCw,
  FileEdit,
  Eye,
  Star,
  Archive,
  Trash2,
} from 'lucide-react';
import api from '../services/api.js';
import { formatDate, formatFullDateTime } from '../utils/formatDate.js';

export const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/activity?limit=50');
      setActivities(res.data.data || []);
    } catch (err) {
      console.warn('Failed to load activities:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActionDetails = (action) => {
    switch (action) {
      case 'EMAIL_SENT':
        return { label: 'Sent Email', icon: Mail, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'EMAIL_OPENED':
        return { label: 'Opened Email', icon: Eye, color: 'text-brand-500 bg-brand-500/10 border-brand-500/20' };
      case 'AI_SUMMARY_GENERATED':
        return { label: 'Generated AI Summary', icon: Sparkles, color: 'text-ai-500 bg-ai-500/10 border-ai-500/20' };
      case 'AI_REPLY_GENERATED':
        return { label: 'Drafted AI Reply', icon: FileEdit, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
      case 'AI_CLASSIFIED':
        return { label: 'AI Classified', icon: Sparkles, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'EMAIL_STARRED':
        return { label: 'Starred Email', icon: Star, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'EMAIL_ARCHIVED':
        return { label: 'Archived Email', icon: Archive, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
      case 'EMAIL_DELETED':
        return { label: 'Deleted Email', icon: Trash2, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      case 'GMAIL_CONNECTED':
        return { label: 'Connected Gmail OAuth', icon: Zap, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      default:
        return { label: action.replace(/_/g, ' '), icon: ActivityIcon, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
                Email Activity History
              </h1>
              <p className="text-xs text-slate-500">Live audit log of all email and AI interactions</p>
            </div>
          </div>

          <button
            onClick={fetchActivities}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh history"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading activity timeline...</div>
          ) : activities.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {activities.map((act) => {
                const details = getActionDetails(act.action);
                const Icon = details.icon;
                return (
                  <div key={act._id} className="relative flex items-start gap-4 text-xs">
                    {/* Bullet icon */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${details.color} shadow-2xs z-10`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>

                    <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {details.label}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatFullDateTime(act.createdAt)}</span>
                      </div>

                      {act.metadata && Object.keys(act.metadata).length > 0 && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                          {act.metadata.subject && <p>Subject: <span className="font-medium">{act.metadata.subject}</span></p>}
                          {act.metadata.to && <p>To: <span className="font-medium">{act.metadata.to}</span></p>}
                          {act.metadata.tone && <p>Tone: <span className="font-medium">{act.metadata.tone}</span></p>}
                          {act.metadata.category && <p>Category: <span className="font-medium">{act.metadata.category}</span></p>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
