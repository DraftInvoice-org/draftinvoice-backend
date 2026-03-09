import { Router } from 'express';
import { signupHandler, loginHandler, logoutHandler, meHandler, forgotPassword, resetPassword } from './auth.controller';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticate, meHandler);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
