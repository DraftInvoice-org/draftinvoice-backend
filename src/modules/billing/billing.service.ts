import { billingRepository } from './billing.repository';
import { authRepository } from '../auth/auth.repository';
import { env } from '../../config/env';

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET_KEY = env.PAYSTACK_SECRET_KEY ?? '';
const PRO_PRICE_KOBO = env.PRO_PRICE_KOBO;
const FRONTEND_URL = env.FRONTEND_URL;

async function paystackFetch(path: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${PAYSTACK_BASE}${path}`, {
        headers: {
            Authorization: `Bearer ${SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    const json = await res.json() as Record<string, unknown>;
    return json;
}

export const billingService = {
    /**
     * Creates a Paystack transaction and saves the reference before redirecting.
     * Returns the authorization_url to redirect the user to.
     */
    async initialize(userId: string): Promise<{ authorizationUrl: string; reference: string }> {
        const user = await authRepository.findById(userId);
        if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
        // Test user plan
        if (user.plan === 'pro') throw Object.assign(new Error('Already on Pro plan'), { status: 400 });
        // Paystack initialize requires a POST — use a separate helper below
        const body = JSON.stringify({
            email: user.email,
            amount: PRO_PRICE_KOBO,
            currency: 'NGN',
            callback_url: `${FRONTEND_URL}/upgrade/callback`,
            metadata: { user_id: userId, plan: 'pro' },
        });

        const initRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body,
        });
        const data = await initRes.json() as {
            status: boolean;
            data: { authorization_url: string; reference: string };
        };

        if (!data.status) throw Object.assign(new Error('Failed to initialize payment'), { status: 502 });

        const { authorization_url: authorizationUrl, reference } = data.data;

        // 🔑 Save reference BEFORE redirecting — resilience anchor
        await billingRepository.saveReference(userId, reference, PRO_PRICE_KOBO);

        return { authorizationUrl, reference };
    },

    /**
     * Verifies a Paystack transaction by reference.
     * Idempotent: calling it multiple times with the same reference is safe.
     */
    async verify(reference: string, userId: string): Promise<{ success: boolean; alreadyPro: boolean }> {
        // Guard: reference must belong to this user
        const event = await billingRepository.getByReference(reference);
        if (!event) throw Object.assign(new Error('Reference not found'), { status: 404 });
        if (event.user_id !== userId) throw Object.assign(new Error('Unauthorized'), { status: 403 });

        // Idempotency: already succeeded → no work needed
        if (event.status === 'success') return { success: true, alreadyPro: true };

        // Verify with Paystack
        const data = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`) as {
            status: boolean;
            data: { status: string;[key: string]: unknown };
        };

        if (!data.status || data.data?.status !== 'success') {
            await billingRepository.markFailed(reference, data as Record<string, unknown>);
            return { success: false, alreadyPro: false };
        }

        await billingRepository.markSuccess(reference, data as Record<string, unknown>);
        return { success: true, alreadyPro: false };
    },

    /**
     * Checks for any pending payment for the user and attempts to verify it.
     * Used for: silent auto-verify on login + "Check status" button.
     * Never throws — returns structured result.
     */
    async checkPendingForUser(userId: string): Promise<{ found: boolean; success: boolean }> {
        const event = await billingRepository.getPendingForUser(userId);
        if (!event) return { found: false, success: false };

        try {
            const result = await billingService.verify(event.reference, userId);
            return { found: true, success: result.success };
        } catch {
            return { found: true, success: false };
        }
    },

    /**
     * Handles Paystack webhooks to confirm payments asynchronously.
     */
    async handleWebhook(signature: string, rawBody: string): Promise<void> {
        const crypto = await import('node:crypto');
        const hash = crypto
            .createHmac('sha512', SECRET_KEY)
            .update(rawBody)
            .digest('hex');

        if (hash !== signature) {
            throw Object.assign(new Error('Invalid signature'), { status: 400 });
        }

        const body = JSON.parse(rawBody);
        const event = body.event;

        if (event === 'charge.success') {
            const reference = body.data.reference;
            const eventData = body.data;

            // We don't need userId from metadata if the reference exists in our DB
            // billingRepository.markSuccess is already idempotent and atomically upgrades
            await billingRepository.markSuccess(reference, eventData);
            console.log(`[Billing] Successfully processed webhook for reference: ${reference}`);
        }
    }
};
