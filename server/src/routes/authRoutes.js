import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate, registerRules, loginRules } from '../middleware/validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerRules), AuthController.register);
router.post('/login', authLimiter, validate(loginRules), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);
router.patch('/preferences', requireAuth, AuthController.updatePreferences);

export default router;
