import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Paperclip, Archive, Trash2, RotateCcw } from 'lucide-react';
import { parseSender, getInitials } from '../../utils/emailParser.js';
import { formatDate } from '../../utils/formatDate.js';
import { PriorityBadge, CategoryBadge } from '../PriorityBadge/PriorityBadge.jsx';
import { useEmailStore } from '../../store/emailStore.js';

export const EmailCard = ({ email }) => {
  const navigate = useNavigate();
  const {
    selectedEmailIds,
    toggleSelectEmail,
    starEmail,
    unstarEmail,
    archiveEmail,
    deleteEmail,
    restoreEmail,
    activeFolder,
  } = useEmailStore();

  const isSelected = selectedEmailIds.includes(email.id);
  const sender = parseSender(email.sender || email.from);
  const isTrashed = email.isTrash || email.labels?.includes('TRASH') || activeFolder === 'trash';

  const handleStarClick = (e) => {
    e.stopPropagation();
    if (email.isStarred) {
      unstarEmail(email.id);
    } else {
      starEmail(email.id);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    toggleSelectEmail(email.id);
  };

  const handleArchiveClick = (e) => {
    e.stopPropagation();
    archiveEmail(email.id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    deleteEmail(email.id);
  };

  const handleRestoreClick = (e) => {
    e.stopPropagation();
    restoreEmail(email.id);
  };

  const handleClick = () => {
    navigate(`/email/${email.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/70 dark:border-slate-800/70 cursor-pointer transition-all ${
        isSelected
          ? 'bg-brand-50/70 dark:bg-brand-950/40'
          : email.isRead
          ? 'bg-white/60 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850'
          : 'bg-white dark:bg-slate-900 font-medium shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-850'
      }`}
    >
      {/* Selection Checkbox */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxClick}
          className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
        />
      </div>

      {/* Star Button */}
      <button
        onClick={handleStarClick}
        className={`p-1 rounded-md transition-colors ${
          email.isStarred
            ? 'text-amber-500 hover:text-amber-600'
            : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 opacity-60 group-hover:opacity-100'
        }`}
        title={email.isStarred ? 'Unstar' : 'Star'}
      >
        <Star className={`w-4 h-4 ${email.isStarred ? 'fill-amber-500' : ''}`} />
      </button>

      {/* Sender Avatar */}
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center flex-shrink-0">
        {getInitials(sender.name)}
      </div>

      {/* Sender Name */}
      <div className="w-36 lg:w-44 flex-shrink-0 truncate">
        <span
          className={`text-xs ${
            email.isRead
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-slate-900 dark:text-slate-100 font-semibold'
          }`}
        >
          {sender.name}
        </span>
      </div>

      {/* Subject & Snippet Preview */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={`text-xs truncate ${
            email.isRead
              ? 'text-slate-700 dark:text-slate-300'
              : 'text-slate-900 dark:text-white font-semibold'
          }`}
        >
          {email.subject || '(No Subject)'}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:inline truncate">
          — {email.snippet || ''}
        </span>
      </div>

      {/* Attachments Icon */}
      {email.attachments && email.attachments.length > 0 && (
        <Paperclip className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      )}

      {/* Badges: Category & Priority */}
      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 group-hover:hidden">
        {email.category && <CategoryBadge category={email.category} />}
        {email.priority && <PriorityBadge priority={email.priority} size="xs" />}
      </div>

      {/* Quick Action Buttons (shown on row hover) */}
      <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {isTrashed ? (
          <>
            <button
              onClick={handleRestoreClick}
              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Restore to Inbox"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Forever"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleArchiveClick}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Date */}
      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0 text-right w-16 group-hover:hidden">
        {formatDate(email.date)}
      </div>
    </div>
  );
};
