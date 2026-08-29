import { Notification } from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';

export const NotificationService = {
  async createNotification({ userId, type = 'info', title, message, link = '', metadata = {} }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        link,
        metadata,
      });

      // Dispatch live real-time notification
      emitToUser(userId.toString(), 'NOTIFICATION', {
        notification,
      });

      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error.message);
      return null;
    }
  },

  async getUserNotifications(userId, limit = 30) {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  },

  async markAllAsRead(userId) {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true });
  },
};
