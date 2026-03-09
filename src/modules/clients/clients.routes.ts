import { Router } from 'express';
import { createClient, getClients, getClient, updateClient, deleteClient } from './clients.controller';
import { authenticate } from '../../middleware/authMiddleware';
import { checkQuota } from '../../middleware/quotaMiddleware';

const router = Router();

router.use(authenticate); // Require auth for all client routes

router.get('/', getClients);
router.post('/', checkQuota('clients'), createClient);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
