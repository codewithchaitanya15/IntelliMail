import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Save,
  Wand2,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore.js';
import { useEmailStore } from '../../store/emailStore.js';
import { aiService } from '../../services/ai.js';
import { validateComposeForm } from '../../utils/validators.js';
import toast from 'react-hot-toast';

export const ComposeModal = () => {
  const { composeOpen, closeCompose, composeDraft, updateComposeDraft } = useUIStore();
  const { sendEmail } = useEmailStore();

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [isMaximized, setIsMaximized] = useState(false);
  const [errors, setErrors] = useState({});

  if (!composeOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    const validation = validateComposeForm(composeDraft);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fill in required email fields');
      return;
    }

    setIsSending(true);
    try {
      await sendEmail(composeDraft);
      closeCompose();
    } catch (err) {
      // Error handled in store
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateSubject = async () => {
    if (!composeDraft.body || composeDraft.body.trim().length < 10) {
      toast.error('Please write some email content first to generate subjects');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await aiService.generateSubject({ body: composeDraft.body });
      if (res.subjects && res.subjects.length > 0) {
        updateComposeDraft({ subject: res.subjects[0] });
        toast.success('Generated smart subject line!');
      }
    } catch (err) {
      toast.error('Failed to generate subject with AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDraftEmailFromSubject = async () => {
    if (!composeDraft.subject || composeDraft.subject.trim().length < 3) {
      toast.error('Please write or generate a subject line first so AI knows what to write');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await aiService.draftEmail({
        subject: composeDraft.subject,
        tone: selectedTone,
        to: composeDraft.to,
      });

      if (res && res.body) {
        updateComposeDraft({ body: res.body });
        toast.success('AI drafted your entire email!');
      }
    } catch (err) {
      toast.error('Failed to write email with AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImproveEmail = async () => {
    if (!composeDraft.body || composeDraft.body.trim().length < 10) {
      toast.error('Please enter message text to improve');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await aiService.improveEmail({
        body: composeDraft.body,
        tone: selectedTone,
      });

      if (res.improvedBody) {
        updateComposeDraft({ body: res.improvedBody });
        toast.success(`Polished email in ${selectedTone} tone!`);
      }
    } catch (err) {
      toast.error('Failed to improve email');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div
      className={`fixed z-50 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 overflow-hidden ${
        isMaximized
          ? 'inset-4 rounded-3xl'
          : 'bottom-0 right-4 sm:right-8 w-full sm:w-[640px] h-[600px] rounded-t-3xl border-b-0'
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-xs">
            {composeDraft.subject ? `Compose: ${composeDraft.subject}` : 'New Message'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={closeCompose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSend} className="flex-1 flex flex-col overflow-hidden text-xs">
        {/* Recipient To */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <span className="text-slate-400 font-medium w-12">To:</span>
          <input
            type="email"
            value={composeDraft.to}
            onChange={(e) => updateComposeDraft({ to: e.target.value })}
            placeholder="recipient@example.com"
            className="flex-1 bg-transparent border-none p-0 focus:outline-hidden text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                type="button"
                onClick={() => setShowBcc(true)}
                className="hover:text-slate-600 dark:hover:text-slate-200"
              >
                Bcc
              </button>
            )}
          </div>
        </div>
        {errors.to && <p className="px-4 py-0.5 text-[10px] text-rose-500">{errors.to}</p>}

        {/* CC Field */}
        {showCc && (
          <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
            <span className="text-slate-400 font-medium w-12">Cc:</span>
            <input
              type="text"
              value={composeDraft.cc || ''}
              onChange={(e) => updateComposeDraft({ cc: e.target.value })}
              placeholder="carbon_copy@example.com"
              className="flex-1 bg-transparent border-none p-0 focus:outline-hidden text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* BCC Field */}
        {showBcc && (
          <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
            <span className="text-slate-400 font-medium w-12">Bcc:</span>
            <input
              type="text"
              value={composeDraft.bcc || ''}
              onChange={(e) => updateComposeDraft({ bcc: e.target.value })}
              placeholder="blind_copy@example.com"
              className="flex-1 bg-transparent border-none p-0 focus:outline-hidden text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Subject Field + AI Generator Actions */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-slate-400 font-medium w-12">Subject:</span>
          <input
            type="text"
            value={composeDraft.subject}
            onChange={(e) => updateComposeDraft({ subject: e.target.value })}
            placeholder="Subject of your email..."
            className="flex-1 min-w-[140px] bg-transparent border-none p-0 focus:outline-hidden text-slate-900 dark:text-slate-100 font-semibold placeholder:text-slate-400 placeholder:font-normal"
          />
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={handleGenerateSubject}
              disabled={isAiLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ai-500/10 text-ai-600 dark:text-ai-400 hover:bg-ai-500/20 text-[11px] font-medium transition-colors cursor-pointer"
              title="Generate smart subject from body content"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Subject</span>
            </button>

            <button
              type="button"
              onClick={handleDraftEmailFromSubject}
              disabled={isAiLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 hover:bg-brand-600/20 border border-brand-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              title="Auto-write complete email body based on this subject"
            >
              <Wand2 className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>Auto-Write Email</span>
            </button>
          </div>
        </div>
        {errors.subject && <p className="px-4 py-0.5 text-[10px] text-rose-500">{errors.subject}</p>}

        {/* Email Body */}
        <div className="flex-1 p-4 overflow-y-auto relative">
          <textarea
            value={composeDraft.body}
            onChange={(e) => updateComposeDraft({ body: e.target.value })}
            placeholder="Write your email here, or click 'Auto-Write Email' above to let AI compose it automatically from your subject..."
            className="w-full h-full bg-transparent border-none p-0 focus:outline-hidden text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-none leading-relaxed text-xs"
          />
        </div>
        {errors.body && <p className="px-4 py-0.5 text-[10px] text-rose-500">{errors.body}</p>}

        {/* Bottom AI Toolbar & Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          {/* AI Tone, Auto-Write and Polish */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="Professional">Tone: Professional</option>
              <option value="Friendly">Tone: Friendly</option>
              <option value="Formal">Tone: Formal</option>
              <option value="Concise">Tone: Concise</option>
            </select>

            <button
              type="button"
              onClick={handleDraftEmailFromSubject}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-500/15 to-indigo-500/15 text-brand-700 dark:text-brand-300 hover:from-brand-500/25 hover:to-indigo-500/25 border border-brand-500/30 rounded-xl font-medium transition-all shadow-2xs cursor-pointer"
              title="Auto-write full email draft from subject"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>Write from Subject</span>
            </button>

            <button
              type="button"
              onClick={handleImproveEmail}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-ai-500/15 to-brand-500/15 text-ai-700 dark:text-ai-300 hover:from-ai-500/25 hover:to-brand-500/25 border border-ai-500/30 rounded-xl font-medium transition-all shadow-2xs cursor-pointer"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>AI Polish</span>
            </button>
          </div>

          {/* Send and Cancel */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeCompose}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-md hover:shadow-glow-brand transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
              <span>{isSending ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
