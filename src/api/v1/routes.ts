import { Router } from 'express';
import { requireApiKey } from '../../middleware/apiKeyAuth';
import { createInvoiceV1, getInvoiceStatusV1, downloadInvoiceV1 } from './invoices.controller';

const router = Router();

// Apply API Key Authentication to all V1 routes
// Publicly accessible download (tracked)
router.get('/invoices/:id/download', downloadInvoiceV1);

// Protected API endpoints
router.use(requireApiKey);
router.post('/invoices', createInvoiceV1);
router.get('/invoices/:id', getInvoiceStatusV1);

export default router;
