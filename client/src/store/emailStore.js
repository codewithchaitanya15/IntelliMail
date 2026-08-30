import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useEmailStore = create((set, get) => ({
  emails: [],
  activeFolder: 'inbox',
  currentEmail: null,
  currentThread: null,
  selectedEmailIds: [],
  searchQuery: '',
  filterPriority: null,
  filterCategory: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,
  stats: {
    unreadCount: 0,
    starredCount: 0,
    highPriorityCount: 0,
    inboxCount: 0,
    totalCount: 0,
  },

  setActiveFolder: (folder) => {
    set({ activeFolder: folder, selectedEmailIds: [], currentEmail: null });
    get().fetchEmails(folder);
  },

  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleSelectEmail: (id) => {
    const selected = get().selectedEmailIds;
    if (selected.includes(id)) {
      set({ selectedEmailIds: selected.filter((item) => item !== id) });
    } else {
      set({ selectedEmailIds: [...selected, id] });
    }
  },

  selectAllEmails: () => {
    const allIds = get().emails.map((e) => e.id);
    set({ selectedEmailIds: allIds });
  },

  clearSelection: () => {
    set({ selectedEmailIds: [] });
  },

  fetchStats: async () => {
    try {
      const res = await api.get('/emails/stats');
      if (res.data?.data) {
        set({ stats: res.data.data });
        return res.data.data;
      }
    } catch (e) {
      const emails = get().emails;
      if (emails && emails.length > 0) {
        set({
          stats: {
            unreadCount: emails.filter((e) => !e.isRead && !e.isTrash).length,
            starredCount: emails.filter((e) => e.isStarred && !e.isTrash).length,
            highPriorityCount: emails.filter((e) => e.priority === 'HIGH' && !e.isTrash).length,
            inboxCount: emails.length,
            totalCount: emails.length,
          },
        });
      }
    }
  },

  fetchEmails: async (folder = null, query = '') => {
    const targetFolder = folder || get().activeFolder;
    set({ isLoading: true, error: null });

    try {
      const res = await api.get('/emails', {
        params: {
          folder: targetFolder,
          query: query || get().searchQuery || '',
        },
      });

      const messages = res.data.data?.messages || [];
      const backendStats = res.data.data?.stats;

      const localUnread = messages.filter((e) => !e.isRead && !e.isTrash).length;
      const localStarred = messages.filter((e) => e.isStarred && !e.isTrash).length;
      const localHighPriority = messages.filter((e) => e.priority === 'HIGH' && !e.isTrash).length;

      const currentStats = get().stats;
      const computedStats = {
        unreadCount: typeof backendStats?.unreadCount === 'number'
          ? backendStats.unreadCount
          : (targetFolder === 'inbox' ? localUnread : (currentStats?.unreadCount || localUnread)),
        starredCount: typeof backendStats?.starredCount === 'number'
          ? backendStats.starredCount
          : (targetFolder === 'starred' ? messages.length : (currentStats?.starredCount || localStarred)),
        highPriorityCount: typeof backendStats?.highPriorityCount === 'number'
          ? backendStats.highPriorityCount
          : (targetFolder === 'inbox' ? localHighPriority : (currentStats?.highPriorityCount || localHighPriority)),
        inboxCount: typeof backendStats?.inboxCount === 'number'
          ? backendStats.inboxCount
          : (targetFolder === 'inbox' ? messages.length : (currentStats?.inboxCount || messages.length)),
        totalCount: typeof backendStats?.totalCount === 'number'
          ? backendStats.totalCount
          : messages.length,
      };

      set({
        emails: messages,
        isLoading: false,
        stats: computedStats,
      });

      return messages;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch emails';
      set({ error: errMsg, isLoading: false });
      return [];
    }
  },

  fetchEmailDetail: async (id) => {
    set({ isDetailLoading: true, error: null });
    try {
      // Explicitly notify backend to mark as read immediately
      api.patch(`/emails/${id}/read`).catch(() => {});
      const res = await api.get(`/emails/${id}`);
      const email = res.data.data;

      // Optimistically update read status and recompute remaining unread counts
      set((state) => {
        const wasUnread = !email.isRead || state.emails.some((e) => e.id === id && !e.isRead);
        const updatedEmail = { ...email, isRead: true };
        const updatedEmails = state.emails.map((e) =>
          e.id === id ? { ...e, isRead: true } : e
        );
        return {
          currentEmail: updatedEmail,
          emails: updatedEmails,
          isDetailLoading: false,
          stats: wasUnread
            ? { ...state.stats, unreadCount: Math.max(0, state.stats.unreadCount - 1) }
            : state.stats,
        };
      });

      return email;
    } catch (err) {
      set({ error: err.message, isDetailLoading: false });
      throw err;
    }
  },

  fetchThread: async (threadId) => {
    try {
      const res = await api.get(`/emails/${threadId}/thread`);
      const thread = res.data.data;
      set({ currentThread: thread });
      return thread;
    } catch (err) {
      console.warn('[EmailStore] Fetch thread failed:', err.message);
      return null;
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/emails/${id}/read`);
      set((state) => {
        const target = state.emails.find((e) => e.id === id);
        const wasUnread = target ? !target.isRead : true;
        const updatedEmails = state.emails.map((e) => (e.id === id ? { ...e, isRead: true } : e));
        return {
          emails: updatedEmails,
          currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isRead: true } : state.currentEmail,
          stats: wasUnread
            ? { ...state.stats, unreadCount: Math.max(0, state.stats.unreadCount - 1) }
            : state.stats,
        };
      });
    } catch (err) {
      toast.error('Failed to mark email as read');
    }
  },

  markAsUnread: async (id) => {
    try {
      await api.patch(`/emails/${id}/unread`);
      set((state) => {
        const target = state.emails.find((e) => e.id === id);
        const wasRead = target ? target.isRead : true;
        const updatedEmails = state.emails.map((e) => (e.id === id ? { ...e, isRead: false } : e));
        return {
          emails: updatedEmails,
          currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isRead: false } : state.currentEmail,
          stats: wasRead
            ? { ...state.stats, unreadCount: state.stats.unreadCount + 1 }
            : state.stats,
        };
      });
      toast.success('Marked as unread');
    } catch (err) {
      toast.error('Failed to mark email as unread');
    }
  },

  starEmail: async (id) => {
    try {
      await api.patch(`/emails/${id}/star`);
      set((state) => {
        const target = state.emails.find((e) => e.id === id);
        const wasStarred = target ? target.isStarred : false;
        const updatedEmails = state.emails.map((e) => (e.id === id ? { ...e, isStarred: true } : e));
        return {
          emails: updatedEmails,
          currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isStarred: true } : state.currentEmail,
          stats: !wasStarred
            ? { ...state.stats, starredCount: state.stats.starredCount + 1 }
            : state.stats,
        };
      });
    } catch (err) {
      toast.error('Failed to star email');
    }
  },

  unstarEmail: async (id) => {
    try {
      await api.patch(`/emails/${id}/unstar`);
      set((state) => {
        const target = state.emails.find((e) => e.id === id);
        const wasStarred = target ? target.isStarred : true;
        const updatedEmails = state.emails.map((e) => (e.id === id ? { ...e, isStarred: false } : e));
        return {
          emails: updatedEmails,
          currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isStarred: false } : state.currentEmail,
          stats: wasStarred
            ? { ...state.stats, starredCount: Math.max(0, state.stats.starredCount - 1) }
            : state.stats,
        };
      });
    } catch (err) {
      toast.error('Failed to unstar email');
    }
  },

  archiveEmail: async (id) => {
    try {
      await api.patch(`/emails/${id}/archive`);
      set((state) => {
        const target = state.emails.find((e) => e.id === id);
        const isUnread = target && !target.isRead;
        const isStarred = target && target.isStarred;
        const updatedEmails = state.emails.filter((e) => e.id !== id);
        return {
          emails: updatedEmails,
          currentEmail: null,
          stats: {
            ...state.stats,
            unreadCount: isUnread ? Math.max(0, state.stats.unreadCount - 1) : state.stats.unreadCount,
            starredCount: isStarred ? Math.max(0, state.stats.starredCount - 1) : state.stats.starredCount,
          },
        };
      });
      toast.success('Email archived');
    } catch (err) {
      toast.error('Failed to archive email');
    }
  },

  deleteEmail: async (id, forcePermanent = false) => {
    const isTrash = get().activeFolder === 'trash' || forcePermanent;
    // Optimistic UI update
    set((state) => {
      const target = state.emails.find((e) => e.id === id);
      const isUnread = target && !target.isRead;
      const isStarred = target && target.isStarred;
      const updatedEmails = state.emails.filter((e) => e.id !== id);
      return {
        emails: updatedEmails,
        currentEmail: state.currentEmail?.id === id ? null : state.currentEmail,
        selectedEmailIds: state.selectedEmailIds.filter((item) => item !== id),
        stats: {
          ...state.stats,
          unreadCount: isUnread ? Math.max(0, state.stats.unreadCount - 1) : state.stats.unreadCount,
          starredCount: isStarred ? Math.max(0, state.stats.starredCount - 1) : state.stats.starredCount,
        },
      };
    });

    try {
      const res = await api.delete(`/emails/${id}${isTrash ? '?permanent=true' : ''}`);
      const permanent = res.data?.data?.permanent ?? isTrash;
      toast.success(permanent ? 'Email permanently deleted' : 'Email moved to trash');
      get().fetchEmails();
    } catch (err) {
      toast.error('Failed to delete email');
      get().fetchEmails();
    }
  },

  restoreEmail: async (id) => {
    // Optimistic UI update
    set((state) => {
      const updatedEmails = state.emails.filter((e) => e.id !== id);
      return {
        emails: updatedEmails,
        currentEmail: state.currentEmail?.id === id ? null : state.currentEmail,
        selectedEmailIds: state.selectedEmailIds.filter((item) => item !== id),
      };
    });

    try {
      await api.patch(`/emails/${id}/restore`);
      toast.success('Email restored to inbox');
      get().fetchEmails();
    } catch (err) {
      toast.error('Failed to restore email');
      get().fetchEmails();
    }
  },

  sendEmail: async (emailData) => {
    try {
      const res = await api.post('/emails/send', emailData);
      toast.success('Email sent successfully!');
      get().fetchEmails();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send email';
      toast.error(msg);
      throw new Error(msg);
    }
  },

  replyEmail: async (replyData) => {
    try {
      const res = await api.post('/emails/reply', replyData);
      toast.success('Reply sent successfully!');
      if (get().currentEmail) {
        get().fetchEmailDetail(get().currentEmail.id);
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reply';
      toast.error(msg);
      throw new Error(msg);
    }
  },

  // Bulk Actions
  bulkMarkRead: async () => {
    const ids = [...get().selectedEmailIds];
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => api.patch(`/emails/${id}/read`)));
    set((state) => {
      const updatedEmails = state.emails.map((e) => (ids.includes(e.id) ? { ...e, isRead: true } : e));
      return {
        emails: updatedEmails,
        selectedEmailIds: [],
        stats: {
          ...state.stats,
          unreadCount: Math.max(0, state.stats.unreadCount - ids.length),
        },
      };
    });
    toast.success(`Marked ${ids.length} emails as read`);
  },

  bulkArchive: async () => {
    const ids = [...get().selectedEmailIds];
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => api.patch(`/emails/${id}/archive`)));
    set((state) => {
      const updatedEmails = state.emails.filter((e) => !ids.includes(e.id));
      return {
        emails: updatedEmails,
        selectedEmailIds: [],
      };
    });
    toast.success(`Archived ${ids.length} emails`);
    get().fetchEmails();
  },

  bulkDelete: async (forcePermanent = false) => {
    const ids = [...get().selectedEmailIds];
    if (ids.length === 0) return;
    const isTrash = get().activeFolder === 'trash' || forcePermanent;
    // Optimistic removal
    set((state) => {
      const updatedEmails = state.emails.filter((e) => !ids.includes(e.id));
      return {
        emails: updatedEmails,
        selectedEmailIds: [],
      };
    });
    try {
      await Promise.all(ids.map((id) => api.delete(`/emails/${id}${isTrash ? '?permanent=true' : ''}`)));
      toast.success(isTrash ? `Permanently deleted ${ids.length} emails` : `Moved ${ids.length} emails to trash`);
      get().fetchEmails();
    } catch (err) {
      toast.error('Failed to delete selected emails');
      get().fetchEmails();
    }
  },

  bulkRestore: async () => {
    const ids = [...get().selectedEmailIds];
    if (ids.length === 0) return;
    // Optimistic removal
    set((state) => {
      const updatedEmails = state.emails.filter((e) => !ids.includes(e.id));
      return {
        emails: updatedEmails,
        selectedEmailIds: [],
      };
    });
    try {
      await Promise.all(ids.map((id) => api.patch(`/emails/${id}/restore`)));
      toast.success(`Restored ${ids.length} emails to inbox`);
      get().fetchEmails();
    } catch (err) {
      toast.error('Failed to restore selected emails');
      get().fetchEmails();
    }
  },

  // AI optimistic updates
  updateEmailAISummary: (emailId, summary) => {
    set((state) => ({
      currentEmail: state.currentEmail?.id === emailId ? { ...state.currentEmail, aiSummary: summary } : state.currentEmail,
    }));
  },

  addEmailAIReply: (emailId, reply) => {
    set((state) => ({
      currentEmail:
        state.currentEmail?.id === emailId
          ? {
              ...state.currentEmail,
              aiReplies: [reply, ...(state.currentEmail.aiReplies || [])],
            }
          : state.currentEmail,
    }));
  },
}));
