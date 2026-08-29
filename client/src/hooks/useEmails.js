import { useEmailStore } from '../store/emailStore.js';

export const useEmails = () => {
  const store = useEmailStore();
  return store;
};
