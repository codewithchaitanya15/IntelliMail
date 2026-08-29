import { Router } from 'express';
import { ActivityController } from '../controllers/activityController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', ActivityController.getActivities);

export default router;
