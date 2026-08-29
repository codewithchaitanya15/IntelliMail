import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Calendar,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  ListOrdered,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AISummaryCard = ({ summary, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (!summary) return null;

  const handleCopy = () => {
    const text = `Executive Summary:\n${summary.summary}\n\nImportant Points:\n${(summary.importantPoints || []).map((p) => `- ${p}`).join('\n')}\n\nAction Items:\n${(summary.actionItems || []).map((a) => `[ ] ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-ai-200 dark:border-ai-800/60 bg-gradient-to-br from-ai-50/80 via-white to-brand-50/40 dark:from-ai-950/40 dark:via-slate-900/80 dark:to-brand-950/20 shadow-md backdrop-blur-md overflow-hidden transition-all duration-200 mb-6">
      {/* Header */}
      <div className="p-4 border-b border-ai-100 dark:border-ai-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-ai-500 to-brand-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                AI Executive Summary
              </h3>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-ai-500/10 text-ai-600 dark:text-ai-400 border border-ai-500/20">
                {summary.model || 'AI Analysis'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Key takeaways, action items & dates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-ai-100/60 dark:hover:bg-ai-900/40 rounded-lg transition-colors"
            title="Copy summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-ai-100/60 dark:hover:bg-ai-900/40 transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 text-xs leading-relaxed">
          {/* Main 1-2 sentence Summary */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-ai-100 dark:border-ai-900/30">
            <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">
              {summary.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Important Points */}
            {summary.importantPoints && summary.importantPoints.length > 0 && (
              <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                  <ListOrdered className="w-3.5 h-3.5 text-brand-500" />
                  <span>Important Points</span>
                </div>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 pl-4 list-disc marker:text-brand-500">
                  {summary.importantPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {summary.actionItems && summary.actionItems.length > 0 && (
              <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Required Actions</span>
                </div>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  {summary.actionItems.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dates & Deadlines */}
            {summary.dates && summary.dates.length > 0 && (
              <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dates & Deadlines</span>
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  {summary.dates.map((d, i) => (
                    <div key={i} className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <span className="font-medium">{d.title || 'Event'}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{d.date} {d.time ? `(${d.time})` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* People Involved & Purpose */}
            <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              {summary.purpose && (
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    <Target className="w-3.5 h-3.5 text-purple-500" />
                    <span>Purpose</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{summary.purpose}</p>
                </div>
              )}

              {summary.people && summary.people.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>Key People</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {summary.people.map((person, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50 text-[11px]">
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
