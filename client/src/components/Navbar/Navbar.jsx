import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Settings,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Mail,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { useEmailStore } from '../../store/emailStore.js';
import { getInitials } from '../../utils/emailParser.js';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme, toggleSidebar, toggleNotificationDrawer, notifications, setActiveAIModal } = useUIStore();
  const { searchQuery, setSearchQuery, fetchEmails } = useEmailStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      fetchEmails('', searchQuery);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between gap-4">
      {/* Left: Mobile Sidebar Toggle + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-ai-500 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-base bg-gradient-to-r from-brand-600 to-ai-600 dark:from-brand-400 dark:to-ai-400 bg-clip-text text-transparent">
              IntelliMail
            </span>
            <span className="text-[10px] block text-slate-400 font-medium -mt-1 tracking-wider uppercase">
              AI Assistant
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Search Bar with AI Smart Search Button */}
      <div className="flex-1 max-w-2xl">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emails by sender, subject, or keywords..."
            className="w-full pl-10 pr-28 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-brand-500/50 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setActiveAIModal('smartSearch')}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-brand-500/10 to-ai-500/10 text-ai-600 dark:text-ai-400 hover:from-brand-500/20 hover:to-ai-500/20 rounded-lg border border-ai-500/20 transition-all shadow-2xs"
            title="Ask AI to construct complex email search"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Search</span>
          </button>
        </form>
      </div>

      {/* Right: Status Pill + Theme Toggle + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gmail Status Pill */}
        <Link
          to="/integrations"
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            user?.gmailConnected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
          }`}
        >
          {user?.gmailConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{user?.isDemoMode ? 'Demo Sandbox' : 'Gmail Connected'}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Connect Gmail</span>
            </>
          )}
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={toggleNotificationDrawer}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/40 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
              {getInitials(user?.name || user?.email || 'U')}
            </div>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings & AI Defaults
                  </Link>
                  <Link
                    to="/integrations"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    Gmail Integrations
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
