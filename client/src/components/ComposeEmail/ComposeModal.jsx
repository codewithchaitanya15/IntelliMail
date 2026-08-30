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

  const TONES = [
    { id: 'Professional', label: 'Professional', icon: '💼' },
    { id: 'Friendly', label: 'Friendly', icon: '😊' },
    { id: 'Formal', label: 'Formal', icon: '👔' },
    { id: 'Concise', label: 'Concise', icon: '⚡' },
  ];

  const handleApplyTone = async (toneName) => {
    setSelectedTone(toneName);

    const currentBody = composeDraft.body?.trim();
    const currentSubject = composeDraft.subject?.trim();

    if (!currentBody && !currentSubject) {
      toast.info(`Selected ${toneName} tone. Type your email and click any tone button to transform it!`);
      return;
    }

    setIsAiLoading(true);
    try {
      if (currentBody && currentBody.length >= 2) {
        const res = await aiService.improveEmail({
          body: currentBody,
          tone: toneName,
        });

        if (res && res.improvedBody) {
          updateComposeDraft({ body: res.improvedBody });
          toast.success(`Rewrote email in ${toneName} tone!`);
        }
      } else if (currentSubject && currentSubject.length >= 2) {
        const res = await aiService.draftEmail({
          subject: currentSubject,
          tone: toneName,
          to: composeDraft.to || '',
        });

        if (res && res.body) {
          updateComposeDraft({ body: res.body });
          toast.success(`Drafted email in ${toneName} tone!`);
        }
      }
    } catch (err) {
      toast.error(`Failed to apply ${toneName} tone`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div
      className={`fixed z-50 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 overflow-hidden ${
        isMaximized
          ? 'inset-4 rounded-3xl'
          : 'bottom-0 right-4 sm:right-8 w-full sm:w-[640px] h-[590px] rounded-t-3xl border-b-0'
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

        {/* Subject Field + AI Generator */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <span className="text-slate-400 font-medium w-12">Subject:</span>
          <input
            type="text"
            value={composeDraft.subject}
            onChange={(e) => updateComposeDraft({ subject: e.target.value })}
            placeholder="Subject of your email..."
            className="flex-1 bg-transparent border-none p-0 focus:outline-hidden text-slate-900 dark:text-slate-100 font-semibold placeholder:text-slate-400 placeholder:font-normal"
          />
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
        </div>
        {errors.subject && <p className="px-4 py-0.5 text-[10px] text-rose-500">{errors.subject}</p>}

        {/* Email Body */}
        <div className="flex-1 p-4 overflow-y-auto">
          <textarea
            value={composeDraft.body}
            onChange={(e) => updateComposeDraft({ body: e.target.value })}
            placeholder="Write your email here, then click any Tone button below to instantly rewrite it with AI..."
            className="w-full h-full bg-transparent border-none p-0 focus:outline-hidden text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-none leading-relaxed text-xs"
          />
        </div>
        {errors.body && <p className="px-4 py-0.5 text-[10px] text-rose-500">{errors.body}</p>}

        {/* Bottom AI Toolbar & Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          {/* Clickable AI Tone Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-0.5 flex items-center gap-1">
              <Wand2 className={`w-3 h-3 text-ai-500 ${isAiLoading ? 'animate-spin' : ''}`} />
              Tone:
            </span>
            {TONES.map((t) => {
              const isActive = selectedTone === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleApplyTone(t.id)}
                  disabled={isAiLoading}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={`Click to rewrite whole email in ${t.label} tone`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Send and Cancel */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeCompose}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors cursor-pointer"
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
