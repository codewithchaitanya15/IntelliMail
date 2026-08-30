import { Router } from 'express';
import { EmailController } from '../controllers/emailController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate, sendEmailRules } from '../middleware/validation.js';

const router = Router();

// Apply auth to all email routes
router.use(requireAuth);

router.get('/', EmailController.listEmails);
router.get('/search', EmailController.searchEmails);
router.get('/stats', EmailController.getStats);
router.get('/:id', EmailController.getEmail);
router.get('/:id/thread', EmailController.getThread);

router.patch('/:id/read', EmailController.markAsRead);
router.patch('/:id/unread', EmailController.markAsUnread);
router.patch('/:id/star', EmailController.starEmail);
router.patch('/:id/unstar', EmailController.unstarEmail);
router.patch('/:id/archive', EmailController.archiveEmail);
router.patch('/:id/restore', EmailController.restoreEmail);

router.delete('/:id', EmailController.deleteEmail);

router.post('/send', validate(sendEmailRules), EmailController.sendEmail);
router.post('/reply', validate(sendEmailRules), EmailController.replyEmail);
router.post('/draft', EmailController.saveDraft);

export default router;
