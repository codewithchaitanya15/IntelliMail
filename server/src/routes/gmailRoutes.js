import { Router } from 'express';
import { GmailController } from '../controllers/gmailController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Start OAuth flow (Protected)
router.get('/oauth/start', requireAuth, GmailController.getOAuthStart);

// OAuth redirect callback from Google (Unprotected / handled via state)
router.get('/oauth/callback', GmailController.handleOAuthCallback);

// Gmail connection status
router.get('/status', requireAuth, GmailController.getStatus);

// Disconnect Gmail
router.post('/disconnect', requireAuth, GmailController.disconnect);

// Switch/connect Demo mode
router.post('/connect-demo', requireAuth, GmailController.connectDemoMode);

export default router;
