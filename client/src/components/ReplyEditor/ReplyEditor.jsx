import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  RotateCw,
  Sliders,
  CheckCircle,
  Copy,
  AlertTriangle,
  FileEdit,
  X,
} from 'lucide-react';
import { aiService } from '../../services/ai.js';
import { useEmailStore } from '../../store/emailStore.js';
import toast from 'react-hot-toast';

export const ReplyEditor = ({ email, onSent, onCancel }) => {
  const [tone, setTone] = useState('Professional');
  const [customInstructions, setCustomInstructions] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const editorRef = useRef(null);

  const { replyEmail } = useEmailStore();

  const tones = ['Professional', 'Friendly', 'Formal', 'Concise'];

  const handleGenerate = async (selectedTone = tone, instructions = customInstructions) => {
    setIsGenerating(true);
    try {
      const res = await aiService.generateReply({
        email,
        emailId: email.id,
        tone: selectedTone,
        customInstructions: instructions,
      });

      setReplyText(res.generatedReply || '');
      setHasGenerated(true);
      toast.success(`Drafted ${selectedTone} reply!`);
    } catch (err) {
      console.error('Failed to generate AI reply:', err);
      toast.error('Failed to generate AI reply');
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically generate draft on first mount
  useEffect(() => {
    if (!replyText && email) {
      handleGenerate('Professional');
    }
    // Scroll into view
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }, [email?.id]);

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }

    setIsSending(true);
    try {
      await replyEmail({
        to: email.sender || email.from,
        subject: email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject || ''}`,
        body: replyText,
        threadId: email.threadId || email.id,
        inReplyTo: email.id,
      });

      toast.success('Reply sent successfully!');
      if (onSent) onSent();
    } catch (err) {
      // Error handled in store
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      ref={editorRef}
      className="rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-white dark:bg-slate-900 shadow-xl overflow-hidden mt-6 animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-brand-50 to-indigo-50/50 dark:from-brand-950/40 dark:to-indigo-950/20 border-b border-brand-100 dark:border-brand-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
              Smart AI Reply Assistant
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Customize tone, review, and confirm before sending
            </p>
          </div>
        </div>

        {/* Tone Selector Pills */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTone(t);
                handleGenerate(t);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                tone === t
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body / Controls */}
      <div className="p-4 space-y-4">
        {/* Custom Instructions Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerate(tone, customInstructions);
            }}
            placeholder="Optional prompt tweaks: e.g. 'Accept for Wednesday only', 'Ask for budget details'..."
            className="flex-1 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-500"
          />
          <button
            onClick={() => handleGenerate(tone, customInstructions)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-ai-600 to-brand-600 hover:from-ai-500 hover:to-brand-500 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Regenerate Draft'}</span>
          </button>
        </div>

        {/* Editable Message Box */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Editable Draft</span>
              {isGenerating && <span className="text-[11px] text-ai-500 animate-pulse font-normal">(AI is drafting your response...)</span>}
            </span>
            <span className="text-[11px] font-normal text-slate-400 truncate max-w-xs">
              Replying to: {email.sender || email.from}
            </span>
          </label>
          <textarea
            rows={8}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isGenerating ? "AI is generating your customized reply..." : "Type your reply message or click Regenerate Draft above..."}
            className="w-full text-xs font-sans bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500 leading-relaxed"
          />
        </div>

        {/* Safety Warning */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            AI responses are never sent automatically. Please verify names, dates, and details before sending.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(replyText);
                toast.success('Reply text copied!');
              }}
              disabled={!replyText}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>

            <button
              onClick={handleSendReply}
              disabled={isSending || !replyText.trim() || isGenerating}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md hover:shadow-glow-brand transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
              <span>{isSending ? 'Sending...' : 'Confirm & Send Reply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
