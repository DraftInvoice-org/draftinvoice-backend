import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { billingService } from './billing.service';

const router = Router();

/**
 * POST /api/billing/initialize
 * Creates a Paystack transaction and saves the reference.
 * Returns the Paystack authorization URL for redirect.
 */
router.post('/initialize', authenticate, async (req: Request, res: Response) => {
    try {
        const result = await billingService.initialize(req.user!.id);
        res.json(result);
    } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        res.status(e.status ?? 500).json({ error: e.message ?? 'Payment initialization failed' });
    }
});

/**
 * GET /api/billing/verify?reference=xxx
 * Verifies a Paystack transaction. Idempotent.
 * On success, upgrades the user to Pro.
 */
router.get('/verify', authenticate, async (req: Request, res: Response) => {
    const rawRef = req.query.reference;
    const reference = typeof rawRef === 'string' ? rawRef : '';
    if (!reference) {
        res.status(400).json({ error: 'reference is required' });
        return;
    }

    try {
        const result = await billingService.verify(reference, req.user!.id);
        res.json(result);
    } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        res.status(e.status ?? 500).json({ error: e.message ?? 'Verification failed' });
    }
});

/**
 * GET /api/billing/status
 * Checks and attempts to verify the user's most recent pending payment.
 * Runs silently — never throws 5xx. Used for:
 *   1. Manual "Check payment status" button
 *   2. Silent auto-verify on login (called at most once per session when plan='free' AND has_pending=true)
 */
router.get('/status', authenticate, async (req: Request, res: Response) => {
    try {
        const result = await billingService.checkPendingForUser(req.user!.id);
        res.json(result);
    } catch {
        // Always return gracefully — never block the app on a billing check
        res.json({ found: false, success: false });
    }
});

/**
 * POST /api/billing/webhook
 * Public endpoint for Paystack to notify us of successful payments.
 */
router.post('/webhook', async (req: Request, res: Response) => {
    const signature = req.headers['x-paystack-signature'];
    const rawBody = (req as any).rawBody;

    if (!signature || typeof signature !== 'string') {
        res.status(400).json({ error: 'Missing signature' });
        return;
    }

    try {
        await billingService.handleWebhook(signature, rawBody);
        res.status(200).send('OK');
    } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        console.error('[Billing Webhook Error]:', e.message);
        res.status(e.status ?? 500).json({ error: e.message ?? 'Webhook processing failed' });
    }
});

export default router;
