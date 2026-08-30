import React from 'react';
import {
  RotateCw,
  RotateCcw,
  Archive,
  Trash2,
  MailCheck,
  CheckSquare,
  Square,
  Filter,
  Inbox as InboxIcon,
} from 'lucide-react';
import { EmailCard } from '../EmailCard/EmailCard.jsx';
import { EmailCardSkeleton } from '../LoadingSkeleton/LoadingSkeleton.jsx';
import { useEmailStore } from '../../store/emailStore.js';

export const EmailList = ({ title = 'Inbox', folder = 'inbox' }) => {
  const {
    emails,
    isLoading,
    fetchEmails,
    selectedEmailIds,
    selectAllEmails,
    clearSelection,
    bulkMarkRead,
    bulkArchive,
    bulkDelete,
    bulkRestore,
    filterPriority,
    setFilterPriority,
    filterCategory,
    setFilterCategory,
    activeFolder,
  } = useEmailStore();

  const isTrashFolder = folder === 'trash' || activeFolder === 'trash';
  const allSelected = emails.length > 0 && selectedEmailIds.length === emails.length;
  const someSelected = selectedEmailIds.length > 0;

  // Filter emails in UI
  const filteredEmails = emails.filter((e) => {
    if (filterPriority && e.priority !== filterPriority) return false;
    if (filterCategory && e.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Select All Checkbox */}
          <button
            onClick={allSelected ? clearSelection : selectAllEmails}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={allSelected ? 'Deselect All' : 'Select All'}
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchEmails(folder)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh emails"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Bulk Actions (visible when items selected) */}
          {someSelected && (
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
              {isTrashFolder ? (
                <>
                  <button
                    onClick={bulkRestore}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Restore selected emails"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore to Inbox</span>
                  </button>
                  <button
                    onClick={() => bulkDelete(isTrashFolder)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={bulkMarkRead}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Mark as Read"
                  >
                    <MailCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark Read</span>
                  </button>
                  <button
                    onClick={bulkArchive}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Archive selected"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Archive</span>
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete selected"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </>
              )}
              <span className="text-xs text-slate-400 font-medium ml-1">
                ({selectedEmailIds.length} selected)
              </span>
            </div>
          )}
        </div>

        {/* Right Filter Chips */}
        <div className="flex items-center gap-2">
          {/* Priority Filter */}
          <select
            value={filterPriority || ''}
            onChange={(e) => setFilterPriority(e.target.value || null)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Work">Work</option>
            <option value="Finance">Finance</option>
            <option value="Personal">Personal</option>
            <option value="Promotions">Promotions</option>
            <option value="Important">Important</option>
          </select>
        </div>
      </div>

      {/* Email List Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && emails.length === 0 ? (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <EmailCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 dark:text-slate-500">
            <InboxIcon className="w-14 h-14 mb-3 opacity-30 stroke-1" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No emails in {title}
            </p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {filteredEmails.map((email) => (
              <EmailCard key={email.id} email={email} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
