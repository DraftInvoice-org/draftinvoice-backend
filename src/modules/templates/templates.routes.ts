import { Router } from 'express';
import { getTemplates, getTemplateById, createTemplate } from './templates.controller';
import { authenticate } from '../../middleware/authMiddleware';
import { checkQuota } from '../../middleware/quotaMiddleware';

const router = Router();

// Only authenticated users can save templates (enforce quota)
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/', authenticate, checkQuota('templates'), createTemplate);

export default router;
