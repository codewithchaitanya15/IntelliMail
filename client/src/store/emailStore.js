import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const computeStats = (emails) => ({
  unreadCount: emails.filter((e) => !e.isRead && !e.isTrash).length,
  starredCount: emails.filter((e) => e.isStarred && !e.isTrash).length,
  highPriorityCount: emails.filter((e) => e.priority === 'HIGH' && !e.isTrash).length,
  totalCount: emails.length,
});

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

      const messages = res.data.data.messages || [];
      const stats = computeStats(messages);

      set({
        emails: messages,
        isLoading: false,
        stats,
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
          stats: wasUnread ? computeStats(updatedEmails) : state.stats,
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
        const updatedEmails = state.emails.map((e) => (e.id === id ? { ...e, isRead: true } : e));
        return {
          emails: updatedEmails,
          currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isRead: true } : state.currentEmail,
          stats: computeStats(updatedEmails),
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
        const updatedEmails = state.emails.map((e) => (e.id === id ? { ...e, isRead: false } : e));
        return {
          emails: updatedEmails,
          currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isRead: false } : state.currentEmail,
          stats: computeStats(updatedEmails),
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
        const updatedEmails = state.emails.map((e) => (e.id === id ? { ...e, isStarred: true } : e));
        return {
          emails: updatedEmails,
          currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isStarred: true } : state.currentEmail,
          stats: computeStats(updatedEmails),
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
        const updatedEmails = state.emails.map((e) => (e.id === id ? { ...e, isStarred: false } : e));
        return {
          emails: updatedEmails,
          currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isStarred: false } : state.currentEmail,
          stats: computeStats(updatedEmails),
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
        const updatedEmails = state.emails.filter((e) => e.id !== id);
        return {
          emails: updatedEmails,
          currentEmail: null,
          stats: computeStats(updatedEmails),
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
      const updatedEmails = state.emails.filter((e) => e.id !== id);
      return {
        emails: updatedEmails,
        currentEmail: state.currentEmail?.id === id ? null : state.currentEmail,
        selectedEmailIds: state.selectedEmailIds.filter((item) => item !== id),
        stats: computeStats(updatedEmails),
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
        stats: computeStats(updatedEmails),
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
        stats: computeStats(updatedEmails),
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
        stats: computeStats(updatedEmails),
      };
    });
    toast.success(`Archived ${ids.length} emails`);
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
        stats: computeStats(updatedEmails),
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
        stats: computeStats(updatedEmails),
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
