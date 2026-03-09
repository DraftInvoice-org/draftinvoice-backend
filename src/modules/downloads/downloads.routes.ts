import { Router } from 'express';
import { downloadHandler } from './downloads.controller';
import { optionalAuthenticate } from '../../middleware/authMiddleware';
import { checkDownloadLimit } from '../../middleware/rateLimiter';

const router = Router();

// optionalAuthenticate to get req.user if present, checkDownloadLimit to enforce rate limit
router.post('/', optionalAuthenticate, checkDownloadLimit, downloadHandler);

export default router;
