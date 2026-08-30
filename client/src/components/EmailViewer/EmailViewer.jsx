import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Reply,
  Sparkles,
  HelpCircle,
  ListTodo,
  Calendar,
  Paperclip,
  Clock,
  Send,
  MoreVertical,
  CheckCircle,
} from 'lucide-react';
import { parseSender, getInitials, sanitizeEmailBody } from '../../utils/emailParser.js';
import { formatFullDateTime } from '../../utils/formatDate.js';
import { PriorityBadge, CategoryBadge } from '../PriorityBadge/PriorityBadge.jsx';
import { AISummaryCard } from '../AISummary/AISummaryCard.jsx';
import { ReplyEditor } from '../ReplyEditor/ReplyEditor.jsx';
import { ExplainEmailModal } from '../AITools/ExplainEmailModal.jsx';
import { ActionItemsWidget } from '../AITools/ActionItemsWidget.jsx';
import { DeadlinesWidget } from '../AITools/DeadlinesWidget.jsx';
import { EmailThread } from '../EmailThread/EmailThread.jsx';
import { EmailViewerSkeleton } from '../LoadingSkeleton/LoadingSkeleton.jsx';
import { useEmailStore } from '../../store/emailStore.js';
import { aiService } from '../../services/ai.js';
import toast from 'react-hot-toast';

export const EmailViewer = ({ emailId }) => {
  const navigate = useNavigate();
  const {
    currentEmail,
    currentThread,
    isDetailLoading,
    fetchEmailDetail,
    fetchThread,
    starEmail,
    unstarEmail,
    archiveEmail,
    deleteEmail,
    restoreEmail,
    markAsUnread,
    updateEmailAISummary,
  } = useEmailStore();

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [showActionItems, setShowActionItems] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);
  const replySectionRef = useRef(null);

  useEffect(() => {
    if (emailId) {
      fetchEmailDetail(emailId);
    }
  }, [emailId]);

  useEffect(() => {
    if (currentEmail?.threadId) {
      fetchThread(currentEmail.threadId);
    }
  }, [currentEmail?.threadId]);

  if (isDetailLoading || !currentEmail) {
    return <EmailViewerSkeleton />;
  }

  const sender = parseSender(currentEmail.sender || currentEmail.from);

  const isTrashed =
    currentEmail.isTrash ||
    currentEmail.labels?.includes('TRASH') ||
    useEmailStore.getState().activeFolder === 'trash';

  const targetEmailId = emailId || currentEmail?.id || currentEmail?._id;

  const handleStarToggle = () => {
    if (currentEmail.isStarred) {
      unstarEmail(targetEmailId);
    } else {
      starEmail(targetEmailId);
    }
  };

  const handleArchive = async () => {
    await archiveEmail(targetEmailId);
    navigate(-1);
  };

  const handleDelete = async () => {
    await deleteEmail(targetEmailId, isTrashed);
    navigate(-1);
  };

  const handleRestore = async () => {
    await restoreEmail(targetEmailId);
    navigate(-1);
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const summary = await aiService.summarizeEmail({
        email: currentEmail,
        emailId: targetEmailId,
      });
      updateEmailAISummary(targetEmailId, summary);
      toast.success('Generated AI summary!');
    } catch (err) {
      toast.error('Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleReplyEditor = () => {
    setShowReplyEditor((prev) => !prev);
    if (!showReplyEditor) {
      setTimeout(() => {
        replySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-20 px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-4">
        {/* Back and Standard Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={handleStarToggle}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              currentEmail.isStarred
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={currentEmail.isStarred ? 'Unstar' : 'Star'}
          >
            <Star className={`w-4 h-4 ${currentEmail.isStarred ? 'fill-amber-500' : ''}`} />
          </button>

          {!isTrashed ? (
            <>
              <button
                onClick={handleArchive}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Archive Email"
              >
                <Archive className="w-4 h-4" />
              </button>

              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Move to Trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRestore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                title="Restore email to Inbox"
              >
                <span>Restore to Inbox</span>
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                title="Permanently Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Forever</span>
              </button>
            </>
          )}
        </div>

        {/* AI Operations Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Summarize with AI */}
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-ai-600 to-brand-600 hover:from-ai-500 hover:to-brand-500 text-white text-xs font-semibold shadow-xs hover:shadow-glow-ai transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
            <span>{isSummarizing ? 'Summarizing...' : 'Summarize'}</span>
          </button>

          {/* Generate AI Reply */}
          <button
            onClick={toggleReplyEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 text-xs font-semibold border border-brand-200 dark:border-brand-800 transition-colors cursor-pointer shadow-xs"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>{showReplyEditor ? 'Hide Reply' : 'AI Reply'}</span>
          </button>

          {/* Explain Email */}
          <button
            onClick={() => setShowExplainModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
            <span className="hidden sm:inline">Explain</span>
          </button>

          {/* Action Items Widget Toggle */}
          <button
            onClick={() => setShowActionItems(!showActionItems)}
            className={`p-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              showActionItems
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
            }`}
            title="Toggle Action Items"
          >
            <ListTodo className="w-4 h-4" />
          </button>

          {/* Deadlines Widget Toggle */}
          <button
            onClick={() => setShowDeadlines(!showDeadlines)}
            className={`p-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              showDeadlines
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
            }`}
            title="Toggle Deadlines"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Email Container */}
      <div className="max-w-4xl mx-auto w-full p-6 space-y-6">
        {/* Subject Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100 leading-tight">
              {currentEmail.subject || '(No Subject)'}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {currentEmail.category && <CategoryBadge category={currentEmail.category} />}
              {currentEmail.priority && <PriorityBadge priority={currentEmail.priority} />}
            </div>
          </div>
        </div>

        {/* AI Summary Card (if generated or stored) */}
        {currentEmail.aiSummary && <AISummaryCard summary={currentEmail.aiSummary} />}

        {/* Side widgets: Action Items & Deadlines if toggled */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showActionItems && <ActionItemsWidget email={currentEmail} />}
          {showDeadlines && <DeadlinesWidget email={currentEmail} />}
        </div>

        {/* Sender & Recipient Information */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {getInitials(sender.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {sender.name}
                </h3>
                <span className="text-xs text-slate-400">&lt;{sender.email}&gt;</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                to <span className="font-medium text-slate-700 dark:text-slate-300">{currentEmail.to}</span>
                {currentEmail.cc && <span className="ml-2">cc: {currentEmail.cc}</span>}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 flex-shrink-0">
            <p>{formatFullDateTime(currentEmail.date)}</p>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div
            className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: sanitizeEmailBody(currentEmail.body || currentEmail.snippet) }}
          />
        </div>

        {/* Attachments Section */}
        {currentEmail.attachments && currentEmail.attachments.length > 0 && (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span>Attachments ({currentEmail.attachments.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentEmail.attachments.map((att, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-2xs"
                >
                  <span>{att.filename || 'Attachment'}</span>
                  {att.size && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({Math.round(att.size / 1024)} KB)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thread History */}
        {currentThread && <EmailThread thread={currentThread} activeEmailId={currentEmail.id} />}

        {/* Quick Action Footer Bar */}
        {!showReplyEditor && (
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Respond directly to {sender.name} with AI drafting assistance:
            </div>
            <button
              onClick={toggleReplyEditor}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md hover:shadow-glow-brand transition-all cursor-pointer"
            >
              <Reply className="w-4 h-4" />
              <span>Draft Reply with AI</span>
            </button>
          </div>
        )}

        {/* Reply Editor (if toggled or triggered) */}
        <div ref={replySectionRef}>
          {showReplyEditor && (
            <ReplyEditor
              email={currentEmail}
              onSent={() => setShowReplyEditor(false)}
              onCancel={() => setShowReplyEditor(false)}
            />
          )}
        </div>
      </div>

      {/* Explain Email Modal */}
      <ExplainEmailModal
        email={currentEmail}
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
      />
    </div>
  );
};
