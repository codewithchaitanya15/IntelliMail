import { ActivityService } from '../services/activityService.js';

export const ActivityController = {
  async getActivities(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const activities = await ActivityService.getUserActivities(req.user._id, limit);
      res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  },
};
