import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { generateApiKey, listApiKeys, revokeApiKey } from './apikey.controller';

import { checkFeature } from '../../middleware/quotaMiddleware';

const router = Router();

router.use(authenticate);
router.use(checkFeature('allowApiKeys'));

router.post('/', generateApiKey);
router.get('/', listApiKeys);
router.delete('/:id', revokeApiKey);

export default router;
