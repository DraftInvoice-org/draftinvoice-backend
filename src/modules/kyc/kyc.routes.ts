import { Router } from 'express';
import { getKycStatus, submitKyc } from './kyc.controller';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.get('/status', authenticate, getKycStatus);
router.post('/submit', authenticate, submitKyc);

export default router;
