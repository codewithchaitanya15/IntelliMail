import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, error, login, register, logout, fetchMe, updatePreferences } =
    useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchMe,
    updatePreferences,
  };
};
