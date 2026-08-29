import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Zap,
  Mail,
  CheckCircle,
  ArrowRight,
  Bot,
  BrainCircuit,
  Lock,
  Layers,
  Inbox,
  Send,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export const Landing = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-ai-500 flex items-center justify-center text-white shadow-glow-brand">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-lg bg-gradient-to-r from-brand-400 via-indigo-300 to-ai-400 bg-clip-text text-transparent">
              IntelliMail
            </span>
            <span className="text-[10px] block text-slate-400 font-medium tracking-wider uppercase">
              AI Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-ai-500 hover:from-brand-400 hover:to-ai-400 text-white text-xs font-semibold shadow-glow-brand transition-all transform hover:scale-105"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-ai-500 hover:from-brand-400 hover:to-ai-400 text-white text-xs font-semibold shadow-glow-brand transition-all transform hover:scale-105"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-20 pb-28 flex flex-col items-center text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-500/20 to-ai-500/20 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-ai-400 mb-8 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-ai-400 animate-pulse" />
          <span>Next-Gen Gmail Management Powered by OpenAI & Gemini</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-white leading-[1.1] mb-6">
          Your Inbox, Transformed by{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-ai-400 bg-clip-text text-transparent">
            Autonomous AI
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
          Securely connect your Gmail with Google OAuth 2.0. Summarize multi-page threads in seconds, generate replies in customizable tones, detect priorities, and extract action items instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-ai-500 hover:from-brand-400 hover:to-ai-400 text-white font-semibold text-sm shadow-glow-brand transition-all transform hover:scale-105"
          >
            <span>Connect Gmail & Try AI Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all"
          >
            Sign In with Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3 hover:border-brand-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Instant Thread Summarization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract key takeaways, participant lists, required actions, and deadlines from long emails in 1 click.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3 hover:border-ai-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-ai-500/10 text-ai-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Controlled AI Replies</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate context-aware responses in Professional, Friendly, Formal, or Concise tones with mandatory human review before sending.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Enterprise Google OAuth 2.0</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OAuth tokens encrypted at rest via AES-256-GCM. We never store or ask for your Google account password.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-6 lg:px-12 bg-slate-900/40 border-y border-slate-900 flex flex-col items-center">
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4 text-center">
          The IntelliMail Lifecycle
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl text-center mb-12">
          A seamless flow designed to protect your privacy while accelerating your workflow 10x.
        </p>

        <div className="max-w-4xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Google OAuth', desc: 'Secure connection directly with official Google permissions' },
            { step: '02', title: 'AI Processing', desc: 'Summaries, priority detection, and action-items extracted' },
            { step: '03', title: 'User Review', desc: 'Edit tones, adjust details, and approve replies' },
            { step: '04', title: 'Gmail API Send', desc: 'Direct delivery through your authenticated Gmail' },
          ].map((item) => (
            <div key={item.step} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <span className="font-mono font-bold text-2xl text-slate-700 block mb-2">{item.step}</span>
              <h4 className="font-bold text-sm text-white mb-1">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 lg:px-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 IntelliMail. Built with React, Express, Gmail API, and AI.</p>
        <div className="flex items-center gap-6">
          <Link to="/login" className="hover:text-slate-300">Login</Link>
          <Link to="/register" className="hover:text-slate-300">Register</Link>
          <Link to="/integrations" className="hover:text-slate-300">Integrations</Link>
        </div>
      </footer>
    </div>
  );
};
