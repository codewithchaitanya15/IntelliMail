import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Paperclip } from 'lucide-react';
import { parseSender, getInitials, sanitizeEmailBody } from '../../utils/emailParser.js';
import { formatDate, formatFullDateTime } from '../../utils/formatDate.js';

export const EmailThread = ({ thread, activeEmailId }) => {
  const [collapsedMessages, setCollapsedMessages] = useState({});

  if (!thread || !thread.messages || thread.messages.length <= 1) {
    return null;
  }

  const toggleCollapse = (id) => {
    setCollapsedMessages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 my-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
        <Clock className="w-3.5 h-3.5" />
        <span>Conversation Thread ({thread.messages.length} messages)</span>
      </div>

      <div className="space-y-3">
        {thread.messages.map((msg, index) => {
          const sender = parseSender(msg.sender || msg.from);
          const isCurrent = msg.id === activeEmailId;
          const isCollapsed = collapsedMessages[msg.id] ?? (!isCurrent && index < thread.messages.length - 1);

          return (
            <div
              key={msg.id || index}
              className={`rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-brand-300 dark:border-brand-800 bg-white dark:bg-slate-900 shadow-md ring-1 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50'
              }`}
            >
              {/* Header */}
              <div
                onClick={() => toggleCollapse(msg.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center">
                    {getInitials(sender.name)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {sender.name}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">&lt;{sender.email}&gt;</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{formatDate(msg.date)}</span>
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>

              {/* Collapsed Snippet / Expanded Content */}
              {!isCollapsed ? (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                  <div
                    className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: sanitizeEmailBody(msg.body || msg.snippet) }}
                  />
                </div>
              ) : (
                <div className="px-4 pb-2 text-[11px] text-slate-500 truncate">
                  {msg.snippet || 'Click to expand message'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
