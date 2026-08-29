import { EmailActivity } from '../models/EmailActivity.js';
import { emitToUser } from '../config/socket.js';

export const ActivityService = {
  async logActivity({ userId, emailId = null, action, metadata = {} }) {
    try {
      const activity = await EmailActivity.create({
        userId,
        emailId,
        action,
        metadata,
      });

      // Emit real-time activity event via Socket.IO
      emitToUser(userId.toString(), 'ACTIVITY_LOGGED', {
        activity,
      });

      return activity;
    } catch (error) {
      console.error('[ActivityService] Error logging activity:', error.message);
      return null;
    }
  },

  async getUserActivities(userId, limit = 50) {
    return EmailActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  },
};
