import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Inbox,
  Star,
  Send,
  Archive,
  Trash2,
  LayoutDashboard,
  Activity,
  Zap,
  Settings,
  Plus,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore.js';
import { useEmailStore } from '../../store/emailStore.js';

export const Sidebar = () => {
  const { sidebarOpen, openCompose } = useUIStore();
  const { stats, fetchStats } = useEmailStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inbox', label: 'Inbox', icon: Inbox, badge: (stats?.unreadCount && stats.unreadCount > 0) ? stats.unreadCount : null, badgeColor: 'bg-brand-500 text-white' },
    { to: '/starred', label: 'Starred', icon: Star, badge: (stats?.starredCount && stats.starredCount > 0) ? stats.starredCount : null, badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
    { to: '/sent', label: 'Sent', icon: Send },
    { to: '/archive', label: 'Archive', icon: Archive },
    { to: '/trash', label: 'Trash', icon: Trash2 },
  ];

  const secondaryNavItems = [
    { to: '/activity', label: 'Activity Log', icon: Activity },
    { to: '/integrations', label: 'Gmail OAuth', icon: Zap },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-all duration-300 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Compose Button */}
      <div className="p-4">
        <button
          onClick={() => openCompose()}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md hover:shadow-glow-brand transition-all transform active:scale-98 group cursor-pointer"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
          <span>Compose Email</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
          Mailbox
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}

        <div className="pt-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
          Workspace
        </div>

        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* AI Assistant Summary Card */}
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-ai-500/10 via-brand-500/5 to-transparent border border-ai-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-md bg-ai-500 flex items-center justify-center text-white">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">AI Assistant</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
          Summarization, reply drafting, and priority detection active.
        </p>
        <div className="flex items-center gap-1 text-[10px] text-ai-600 dark:text-ai-400 font-medium">
          <Sparkles className="w-3 h-3" />
          <span>Multi-Provider (OpenAI & Gemini)</span>
        </div>
      </div>
    </aside>
  );
};
