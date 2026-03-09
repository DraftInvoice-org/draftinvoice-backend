import { Router } from 'express';
import { getMe, deleteMe } from './users.controller';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.get('/me', authenticate, getMe);
router.delete('/me', authenticate, deleteMe);

export default router;
