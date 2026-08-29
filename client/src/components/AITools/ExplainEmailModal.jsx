import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Sparkles, CheckCircle, Calendar, AlertCircle, Copy, Check } from 'lucide-react';
import { aiService } from '../../services/ai.js';
import toast from 'react-hot-toast';

export const ExplainEmailModal = ({ email, isOpen, onClose }) => {
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && email) {
      handleExplain();
    }
  }, [isOpen, email]);

  const handleExplain = async () => {
    setIsLoading(true);
    try {
      const data = await aiService.explainEmail({ email });
      setExplanation(data);
    } catch (err) {
      toast.error('Failed to generate simplified explanation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    const text = `Simple Explanation:\n${explanation.simpleExplanation}\n\nRequired Actions:\n${(explanation.requiredActions || []).map((a) => `- ${a}`).join('\n')}\n\nDeadlines:\n${(explanation.deadlines || []).map((d) => `- ${d}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Explanation copied');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-ai-500/10 via-brand-500/10 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ai-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-ai">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 font-display">
                Explain This Email
              </h3>
              <p className="text-xs text-slate-500">De-jargoned plain English breakdown</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Sparkles className="w-8 h-8 text-ai-500 animate-spin" />
              <p className="font-medium text-sm">Simplifying email content...</p>
            </div>
          ) : explanation ? (
            <>
              {/* Plain English Summary */}
              <div className="p-4 rounded-2xl bg-ai-50/50 dark:bg-ai-950/30 border border-ai-200/60 dark:border-ai-900/60 leading-relaxed text-slate-800 dark:text-slate-200">
                <h4 className="font-semibold text-ai-700 dark:text-ai-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Plain English Explanation
                </h4>
                <p className="text-sm font-medium">{explanation.simpleExplanation}</p>
              </div>

              {/* Required Actions */}
              {explanation.requiredActions && explanation.requiredActions.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> What You Need To Do
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc marker:text-emerald-500 text-slate-700 dark:text-slate-300">
                    {explanation.requiredActions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deadlines */}
              {explanation.deadlines && explanation.deadlines.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-500" /> Key Dates & Deadlines
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc marker:text-amber-500 text-slate-700 dark:text-slate-300">
                    {explanation.deadlines.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important Instructions */}
              {explanation.importantInstructions && explanation.importantInstructions.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-brand-500" /> Crucial Instructions
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc marker:text-brand-500 text-slate-700 dark:text-slate-300">
                    {explanation.importantInstructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={handleCopy}
            disabled={!explanation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Explanation'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
