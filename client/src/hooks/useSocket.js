import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { useEmailStore } from '../store/emailStore.js';
import { useUIStore } from '../store/uiStore.js';
import { initSocketClient, getSocket } from '../services/socket.js';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { token, user } = useAuthStore();
  const { fetchEmails, updateEmailAISummary, addEmailAIReply } = useEmailStore();
  const { addNotification, setAIProcessingStatus } = useUIStore();

  useEffect(() => {
    if (!token || !user) return;

    const socket = initSocketClient(token);

    socket.on('AI_PROCESSING', (data) => {
      setAIProcessingStatus(data);
    });

    socket.on('AI_SUMMARY_COMPLETED', (data) => {
      setAIProcessingStatus(null);
      if (data.emailId && data.summary) {
        updateEmailAISummary(data.emailId, data.summary);
      }
      toast.success('AI Email summary generated!');
    });

    socket.on('AI_REPLY_GENERATED', (data) => {
      setAIProcessingStatus(null);
      if (data.emailId && data.reply) {
        addEmailAIReply(data.emailId, data.reply);
      }
      toast.success('AI reply drafted successfully!');
    });

    socket.on('EMAIL_UPDATED', () => {
      fetchEmails();
    });

    socket.on('EMAIL_SENT', (data) => {
      toast.success(`Sent to ${data.to}`);
      fetchEmails();
    });

    socket.on('NOTIFICATION', (data) => {
      if (data.notification) {
        addNotification(data.notification);
        toast(data.notification.title, {
          icon: data.notification.type === 'success' ? '✅' : '🔔',
        });
      }
    });

    socket.on('BULK_PROCESSING_COMPLETED', (data) => {
      toast.success(`Processed ${data.total} emails with AI`);
      fetchEmails();
    });

    return () => {
      socket.off('AI_PROCESSING');
      socket.off('AI_SUMMARY_COMPLETED');
      socket.off('AI_REPLY_GENERATED');
      socket.off('EMAIL_UPDATED');
      socket.off('EMAIL_SENT');
      socket.off('NOTIFICATION');
      socket.off('BULK_PROCESSING_COMPLETED');
    };
  }, [token, user]);
};
