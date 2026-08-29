import { NotificationService } from '../services/notificationService.js';

export const NotificationController = {
  async getNotifications(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 30;
      const notifications = await NotificationService.getUserNotifications(req.user._id, limit);
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user._id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  },
};
