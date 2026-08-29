import React, { useEffect } from 'react';
import { X, Bell, CheckCheck, Info, AlertTriangle, CheckCircle, Mail, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/uiStore.js';
import { formatDate } from '../../utils/formatDate.js';

export const NotificationDrawer = () => {
  const {
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    notifications,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useUIStore();

  useEffect(() => {
    if (notificationDrawerOpen) {
      fetchNotifications();
    }
  }, [notificationDrawerOpen]);

  if (!notificationDrawerOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
      case 'email_sent':
        return <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'ai_completed':
        return <Sparkles className="w-5 h-5 text-ai-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-brand-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-500" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 p-1"
                >
                  <CheckCheck className="w-4 h-4" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setNotificationDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1">Updates on AI summaries, emails, and sync will appear here.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => !item.isRead && markNotificationRead(item._id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                    item.isRead
                      ? 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'
                      : 'bg-brand-50/40 dark:bg-brand-950/30 border-brand-200/60 dark:border-brand-900/60 text-slate-900 dark:text-slate-100 shadow-xs'
                  }`}
                >
                  {getIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-xs font-semibold truncate pr-2">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2">{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
