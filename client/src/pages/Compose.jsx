import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Wand2, ArrowLeft } from 'lucide-react';
import { useEmailStore } from '../store/emailStore.js';
import { aiService } from '../services/ai.js';
import { validateComposeForm } from '../utils/validators.js';
import toast from 'react-hot-toast';

export const Compose = () => {
  const navigate = useNavigate();
  const { sendEmail } = useEmailStore();

  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [isSending, setIsSending] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSend = async (e) => {
    e.preventDefault();
    const validation = validateComposeForm({ to, subject, body });
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please complete required fields');
      return;
    }

    setIsSending(true);
    try {
      await sendEmail({ to, cc, bcc, subject, body });
      navigate('/inbox');
    } catch (err) {
      // Handled in store
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateSubject = async () => {
    if (!body.trim()) {
      toast.error('Write email body content first');
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await aiService.generateSubject({ body });
      if (res.subjects && res.subjects.length > 0) {
        setSubject(res.subjects[0]);
        toast.success('Generated AI subject!');
      }
    } catch (err) {
      toast.error('Failed to generate subject');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!body.trim()) {
      toast.error('Enter some text to improve');
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await aiService.improveEmail({ body, tone: selectedTone });
      if (res.improvedBody) {
        setBody(res.improvedBody);
        toast.success(`Improved in ${selectedTone} tone!`);
      }
    } catch (err) {
      toast.error('Failed to polish email');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              New Message
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300"
            >
              <option value="Professional">Tone: Professional</option>
              <option value="Friendly">Tone: Friendly</option>
              <option value="Formal">Tone: Formal</option>
              <option value="Concise">Tone: Concise</option>
            </select>
            <button
              onClick={handleImprove}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-ai-500/15 to-brand-500/15 text-ai-700 dark:text-ai-300 border border-ai-500/30 rounded-xl text-xs font-semibold hover:bg-ai-500/25 transition-all cursor-pointer"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>AI Polish</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">To</label>
            <input
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
            />
            {errors.to && <p className="text-rose-500 text-[10px] mt-1">{errors.to}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cc</label>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="optional_cc@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bcc</label>
              <input
                type="text"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="optional_bcc@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Subject</label>
              <button
                type="button"
                onClick={handleGenerateSubject}
                className="text-[11px] text-ai-600 dark:text-ai-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Generate with AI
              </button>
            </div>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-hidden focus:border-brand-500"
            />
            {errors.subject && <p className="text-rose-500 text-[10px] mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <textarea
              rows={12}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compose your email..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:outline-hidden focus:border-brand-500"
            />
            {errors.body && <p className="text-rose-500 text-[10px] mt-1">{errors.body}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''}`} />
              <span>{isSending ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
