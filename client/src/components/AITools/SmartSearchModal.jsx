import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Search, ArrowRight, CornerDownLeft } from 'lucide-react';
import { aiService } from '../../services/ai.js';
import { useEmailStore } from '../../store/emailStore.js';
import { useUIStore } from '../../store/uiStore.js';
import toast from 'react-hot-toast';

export const SmartSearchModal = () => {
  const navigate = useNavigate();
  const { activeAIModal, setActiveAIModal } = useUIStore();
  const { fetchEmails, setSearchQuery } = useEmailStore();

  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  if (activeAIModal !== 'smartSearch') return null;

  const handleSmartSearch = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    try {
      const data = await aiService.smartSearch({ query: prompt });
      setResult(data);
    } catch (err) {
      toast.error('Failed to parse search query with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = (query) => {
    setSearchQuery(query);
    setActiveAIModal(null);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    fetchEmails('', query);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setActiveAIModal(null)} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 bg-gradient-to-r from-ai-500/10 via-brand-500/10 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ai-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-ai">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                Smart Natural Language Search
              </h3>
              <p className="text-[11px] text-slate-500">Ask AI in plain English to find matching emails</p>
            </div>
          </div>
          <button
            onClick={() => setActiveAIModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <form onSubmit={handleSmartSearch} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'Show me invoices from Acme with attachments from last month'..."
                className="w-full pl-3.5 pr-24 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={isProcessing || !prompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Interpret</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-slate-400 text-[11px]">Suggestions:</span>
              {[
                'Emails from Sarah about migration',
                'Unread interview invitations',
                'Invoices with attachments',
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setPrompt(s);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-[11px]"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          {result && (
            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/60 space-y-3 animate-in fade-in duration-150">
              <div>
                <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                  Interpreted Gmail Query:
                </span>
                <div className="mt-1 p-2.5 rounded-xl bg-white dark:bg-slate-900 font-mono text-xs text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span>{result.gmailQuery}</span>
                  <button
                    onClick={() => handleApply(result.gmailQuery)}
                    className="flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    <span>Search Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{result.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
