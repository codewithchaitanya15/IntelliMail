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
      
      // Compute counts
      const unreadCount = messages.filter((e) => !e.isRead).length;
      const starredCount = messages.filter((e) => e.isStarred).length;
      const highPriorityCount = messages.filter((e) => e.priority === 'HIGH').length;

      set({
        emails: messages,
        isLoading: false,
        stats: {
          unreadCount,
          starredCount,
          highPriorityCount,
          totalCount: messages.length,
        },
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
      const res = await api.get(`/emails/${id}`);
      const email = res.data.data;
      set({ currentEmail: email, isDetailLoading: false });

      // If unread, optimistically update in email list
      if (!email.isRead) {
        set((state) => ({
          emails: state.emails.map((e) => (e.id === id ? { ...e, isRead: true } : e)),
        }));
      }

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
      set((state) => ({
        emails: state.emails.map((e) => (e.id === id ? { ...e, isRead: true } : e)),
        currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isRead: true } : state.currentEmail,
      }));
    } catch (err) {
      toast.error('Failed to mark email as read');
    }
  },

  markAsUnread: async (id) => {
    try {
      await api.patch(`/emails/${id}/unread`);
      set((state) => ({
        emails: state.emails.map((e) => (e.id === id ? { ...e, isRead: false } : e)),
        currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isRead: false } : state.currentEmail,
      }));
      toast.success('Marked as unread');
    } catch (err) {
      toast.error('Failed to mark email as unread');
    }
  },

  starEmail: async (id) => {
    try {
      await api.patch(`/emails/${id}/star`);
      set((state) => ({
        emails: state.emails.map((e) => (e.id === id ? { ...e, isStarred: true } : e)),
        currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isStarred: true } : state.currentEmail,
      }));
    } catch (err) {
      toast.error('Failed to star email');
    }
  },

  unstarEmail: async (id) => {
    try {
      await api.patch(`/emails/${id}/unstar`);
      set((state) => ({
        emails: state.emails.map((e) => (e.id === id ? { ...e, isStarred: false } : e)),
        currentEmail: state.currentEmail?.id === id ? { ...state.currentEmail, isStarred: false } : state.currentEmail,
      }));
    } catch (err) {
      toast.error('Failed to unstar email');
    }
  },

  archiveEmail: async (id) => {
    try {
      await api.patch(`/emails/${id}/archive`);
      set((state) => ({
        emails: state.emails.filter((e) => e.id !== id),
        currentEmail: null,
      }));
      toast.success('Email archived');
    } catch (err) {
      toast.error('Failed to archive email');
    }
  },

  deleteEmail: async (id) => {
    try {
      const res = await api.delete(`/emails/${id}`);
      const isPermanent = res.data?.data?.permanent || get().currentFolder === 'trash';
      set((state) => ({
        emails: state.emails.filter((e) => e.id !== id),
        currentEmail: null,
      }));
      toast.success(isPermanent ? 'Email permanently deleted' : 'Email moved to trash');
    } catch (err) {
      toast.error('Failed to delete email');
    }
  },

  restoreEmail: async (id) => {
    try {
      await api.patch(`/emails/${id}/restore`);
      set((state) => ({
        emails: state.emails.filter((e) => e.id !== id),
        currentEmail: null,
      }));
      toast.success('Email restored to inbox');
    } catch (err) {
      toast.error('Failed to restore email');
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
    const ids = get().selectedEmailIds;
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => api.patch(`/emails/${id}/read`)));
    set((state) => ({
      emails: state.emails.map((e) => (ids.includes(e.id) ? { ...e, isRead: true } : e)),
      selectedEmailIds: [],
    }));
    toast.success(`Marked ${ids.length} emails as read`);
  },

  bulkArchive: async () => {
    const ids = get().selectedEmailIds;
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => api.patch(`/emails/${id}/archive`)));
    set((state) => ({
      emails: state.emails.filter((e) => !ids.includes(e.id)),
      selectedEmailIds: [],
    }));
    toast.success(`Archived ${ids.length} emails`);
  },

  bulkDelete: async () => {
    const ids = get().selectedEmailIds;
    if (ids.length === 0) return;
    const isTrashFolder = get().currentFolder === 'trash';
    await Promise.all(ids.map((id) => api.delete(`/emails/${id}`)));
    set((state) => ({
      emails: state.emails.filter((e) => !ids.includes(e.id)),
      selectedEmailIds: [],
    }));
    toast.success(isTrashFolder ? `Permanently deleted ${ids.length} emails` : `Moved ${ids.length} emails to trash`);
  },

  bulkRestore: async () => {
    const ids = get().selectedEmailIds;
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => api.patch(`/emails/${id}/restore`)));
    set((state) => ({
      emails: state.emails.filter((e) => !ids.includes(e.id)),
      selectedEmailIds: [],
    }));
    toast.success(`Restored ${ids.length} emails to inbox`);
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
