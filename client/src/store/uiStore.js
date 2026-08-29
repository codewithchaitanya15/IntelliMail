import { create } from 'zustand';
import api from '../services/api.js';

export const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  theme: localStorage.getItem('theme') || 'dark',
  composeOpen: false,
  composeDraft: {
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    inReplyTo: null,
    references: null,
    threadId: null,
  },
  notificationDrawerOpen: false,
  notifications: [],
  activeAIModal: null, // 'summary' | 'reply' | 'explain' | 'actionItems' | 'dates' | 'smartSearch' | null
  aiProcessingStatus: null, // { type, emailId, message }

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  openCompose: (initialData = {}) => {
    set({
      composeOpen: true,
      composeDraft: {
        to: initialData.to || '',
        cc: initialData.cc || '',
        bcc: initialData.bcc || '',
        subject: initialData.subject || '',
        body: initialData.body || '',
        inReplyTo: initialData.inReplyTo || null,
        references: initialData.references || null,
        threadId: initialData.threadId || null,
      },
    });
  },

  closeCompose: () => set({ composeOpen: false }),

  updateComposeDraft: (fields) => {
    set((state) => ({
      composeDraft: { ...state.composeDraft, ...fields },
    }));
  },

  toggleNotificationDrawer: () =>
    set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),
  setNotificationDrawerOpen: (open) => set({ notificationDrawerOpen: open }),

  setActiveAIModal: (modalName) => set({ activeAIModal: modalName }),
  setAIProcessingStatus: (status) => set({ aiProcessingStatus: status }),

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      const notifications = res.data.data || [];
      set({ notifications });
    } catch (err) {
      console.warn('[UIStore] Fetch notifications failed:', err.message);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  markNotificationRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
      }));
    } catch (err) {
      console.warn('[UIStore] Mark notification read failed:', err.message);
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (err) {
      console.warn('[UIStore] Mark all notifications read failed:', err.message);
    }
  },
}));
