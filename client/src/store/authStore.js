import { create } from 'zustand';
import api from '../services/api.js';
import { initSocketClient, disconnectSocket } from '../services/socket.js';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      initSocketClient(token);
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user, token } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      initSocketClient(token);
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  fetchMe: async () => {
    if (!get().token) return null;
    try {
      const res = await api.get('/auth/me');
      const user = res.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return user;
    } catch (err) {
      if (err.response?.status === 401) {
        get().logout();
      }
      return null;
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const res = await api.patch('/auth/preferences', preferences);
      const updatedPrefs = res.data.data;
      const currentUser = get().user;
      if (currentUser) {
        const newUser = { ...currentUser, preferences: updatedPrefs };
        localStorage.setItem('user', JSON.stringify(newUser));
        set({ user: newUser });
      }
      return updatedPrefs;
    } catch (err) {
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
