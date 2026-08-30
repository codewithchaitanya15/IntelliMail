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
  Shield,
  ShieldAlert,
  ShieldCheck,
  Languages,
  ChevronDown,
  Activity,
  AlertTriangle,
  Flame,
  Smile,
  Frown,
  Briefcase,
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
  const [securityData, setSecurityData] = useState(null);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  // Translation State
  const [translatedBody, setTranslatedBody] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);

  const replySectionRef = useRef(null);

  const TRANSLATE_LANGUAGES = ['Spanish', 'French', 'German', 'Japanese', 'Hindi', 'Chinese', 'Italian', 'Portuguese', 'Arabic'];

  useEffect(() => {
    if (emailId) {
      fetchEmailDetail(emailId);
      setTranslatedBody(null);
      setSelectedLanguage(null);
      setSecurityData(null);
    }
  }, [emailId]);

  useEffect(() => {
    if (currentEmail?.threadId) {
      fetchThread(currentEmail.threadId);
    }
    // Auto-fetch Security and Sentiment Analysis on load
    if (currentEmail && !securityData && !isSecurityLoading) {
      loadSecurityAndSentiment();
    }
  }, [currentEmail?.id, currentEmail?.threadId]);

  const loadSecurityAndSentiment = async () => {
    if (!currentEmail) return;
    setIsSecurityLoading(true);
    try {
      const data = await aiService.analyzeSecurityAndSentiment({
        email: currentEmail,
        sender: currentEmail.sender || currentEmail.from,
        subject: currentEmail.subject,
        body: currentEmail.body || currentEmail.snippet,
      });
      setSecurityData(data);
    } catch (e) {
      console.warn('Security analysis fallback error:', e);
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleTranslate = async (targetLanguage) => {
    setShowTranslateMenu(false);
    if (!currentEmail?.body && !currentEmail?.snippet) return;

    setIsTranslating(true);
    try {
      const res = await aiService.translateEmail({
        text: currentEmail.body || currentEmail.snippet,
        targetLanguage,
      });
      if (res && res.translatedText) {
        setTranslatedBody(res.translatedText);
        setSelectedLanguage(targetLanguage);
        toast.success(`Translated into ${targetLanguage}!`);
      }
    } catch (e) {
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleResetTranslation = () => {
    setTranslatedBody(null);
    setSelectedLanguage(null);
  };

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

  const getSentimentBadge = (emotion) => {
    switch (emotion) {
      case 'Friendly':
        return { label: 'Friendly & Warm', icon: Smile, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'Frustrated':
        return { label: 'Frustrated / Urgent Concern', icon: Frown, color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
      case 'Urgent':
        return { label: 'High Urgency', icon: Flame, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'Formal':
        return { label: 'Formal Business', icon: Briefcase, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      default:
        return { label: 'Neutral Tone', icon: Activity, color: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const security = securityData?.security;
  const sentiment = securityData?.sentiment;
  const sentimentInfo = sentiment ? getSentimentBadge(sentiment.emotion) : null;
  const SentimentIcon = sentimentInfo?.icon;

  const isPhishingRisk = security?.riskLevel === 'PHISHING';
  const isSuspicious = security?.riskLevel === 'SUSPICIOUS';

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

          {/* Translate Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setShowTranslateMenu((prev) => !prev)}
              disabled={isTranslating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Translate email body"
            >
              <Languages className={`w-3.5 h-3.5 text-brand-500 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>{selectedLanguage ? `Translated (${selectedLanguage})` : 'Translate'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTranslateMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 w-36 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Translate to
                </div>
                {TRANSLATE_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleTranslate(lang)}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 transition-colors cursor-pointer"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

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

              {/* Sender Emotion & Urgency Gauge Badge */}
              {sentiment && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${sentimentInfo.color}`}
                  title={`Sender Sentiment: ${sentiment.emotion} | Urgency: ${sentiment.urgency}`}
                >
                  {SentimentIcon && <SentimentIcon className="w-3.5 h-3.5" />}
                  <span>{sentimentInfo.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({sentiment.urgency} Urgency)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🛡️ AI Security & Scam Trust Shield Banner */}
        {security && (
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isPhishingRisk
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                : isSuspicious
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl text-white ${
                    isPhishingRisk
                      ? 'bg-rose-600'
                      : isSuspicious
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {isPhishingRisk ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : isSuspicious ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isPhishingRisk
                        ? '🚨 High Risk Phishing Warning'
                        : isSuspicious
                        ? '⚠️ Suspicious Sender Notice'
                        : '🛡️ Verified Authentic Communication'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isPhishingRisk
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                          : isSuspicious
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      Trust Score: {security.trustScore}%
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">
                    {security.recommendation} {sentiment?.toneSummary && `• ${sentiment.toneSummary}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSecurityDetails((prev) => !prev)}
                className="text-xs font-semibold underline opacity-80 hover:opacity-100 cursor-pointer"
              >
                {showSecurityDetails ? 'Hide Security Details' : 'View Security Details →'}
              </button>
            </div>

            {/* Expandable Security Breakdown */}
            {showSecurityDetails && (
              <div className="mt-3 pt-3 border-t border-current/15 text-xs space-y-1.5 animate-in fade-in duration-150">
                <p>
                  <strong className="font-semibold">Domain Check:</strong> {security.domainCheck}
                </p>
                <div className="flex items-start gap-1">
                  <strong className="font-semibold">Indicators:</strong>
                  <ul className="list-disc list-inside space-y-0.5">
                    {security.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* Translation Banner (if translated) */}
        {translatedBody && (
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-between text-xs text-brand-900 dark:text-brand-200">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-brand-500" />
              <span>Translated into <strong>{selectedLanguage}</strong> via Gemini AI</span>
            </div>
            <button
              onClick={handleResetTranslation}
              className="font-semibold underline hover:text-brand-600 cursor-pointer"
            >
              Show Original English
            </button>
          </div>
        )}

        {/* Email Body */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div
            className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: sanitizeEmailBody(translatedBody || currentEmail.body || currentEmail.snippet),
            }}
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

