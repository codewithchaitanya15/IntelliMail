import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post('/summarize', AIController.summarize);
router.post('/generate-reply', AIController.generateReply);
router.post('/classify', AIController.classify);
router.post('/priority', AIController.detectPriority);
router.post('/explain', AIController.explain);
router.post('/action-items', AIController.extractActionItems);
router.post('/extract-dates', AIController.extractDates);
router.post('/generate-subject', AIController.generateSubject);
router.post('/draft-email', AIController.draftEmail);
router.post('/draft', AIController.draftEmail);
router.post('/auto-write', AIController.draftEmail);
router.post('/improve-email', AIController.improveEmail);
router.post('/smart-search', AIController.smartSearch);

export default router;
