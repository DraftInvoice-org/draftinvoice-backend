import { Router } from 'express';
import {
    createInvoice, getInvoices, getInvoiceById,
    updateInvoice, deleteInvoice, markInvoicePaid, sendInvoiceEmail
} from './invoices.controller';
import { authenticate } from '../../middleware/authMiddleware';
import { checkQuota } from '../../middleware/quotaMiddleware';

const router = Router();
router.use(authenticate);

router.get('/', getInvoices);
router.post('/', checkQuota('invoices'), createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.patch('/:id/mark-paid', markInvoicePaid);
router.post('/:id/send-email', sendInvoiceEmail);

export default router;
