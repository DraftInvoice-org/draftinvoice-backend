import { query } from '../../config/database';

export interface BillingEventRow {
    id: string;
    user_id: string;
    reference: string;
    status: 'pending' | 'success' | 'failed';
    amount_kobo: number;
    currency: string;
    payload: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export const billingRepository = {
    /** Save a reference at initialization — before redirecting the user. */
    async saveReference(
        userId: string,
        reference: string,
        amountKobo: number
    ): Promise<BillingEventRow> {
        const result = await query(
            `INSERT INTO billing_events (user_id, reference, amount_kobo)
             VALUES ($1, $2, $3)
             ON CONFLICT (reference) DO NOTHING
             RETURNING *`,
            [userId, reference, amountKobo]
        );
        return result.rows[0];
    },

    /** Mark a reference successful and upgrade the user's plan atomically. */
    async markSuccess(
        reference: string,
        payload: Record<string, unknown>
    ): Promise<void> {
        await query(
            `UPDATE billing_events
             SET status = 'success', payload = $2, updated_at = NOW()
             WHERE reference = $1`,
            [reference, JSON.stringify(payload)]
        );
        // Upgrade the user plan atomically in the same transaction context
        await query(
            `UPDATE users u
             SET plan = 'pro', updated_at = NOW()
             FROM billing_events be
             WHERE be.reference = $1
               AND be.user_id = u.id
               AND u.plan <> 'pro'`,
            [reference]
        );
    },

    /** Mark a reference as failed. */
    async markFailed(reference: string, payload: Record<string, unknown>): Promise<void> {
        await query(
            `UPDATE billing_events
             SET status = 'failed', payload = $2, updated_at = NOW()
             WHERE reference = $1`,
            [reference, JSON.stringify(payload)]
        );
    },

    /** Get the most recent pending event for a user (for silent auto-verify). */
    async getPendingForUser(userId: string): Promise<BillingEventRow | null> {
        const result = await query(
            `SELECT * FROM billing_events
             WHERE user_id = $1 AND status = 'pending'
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
        );
        return result.rows[0] ?? null;
    },

    /** Check if a user has any pending payment (for /auth/me response). */
    async hasPending(userId: string): Promise<boolean> {
        const result = await query(
            `SELECT 1 FROM billing_events
             WHERE user_id = $1 AND status = 'pending'
             LIMIT 1`,
            [userId]
        );
        return (result.rowCount || 0) > 0;
    },

    /** Get a specific event by reference. */
    async getByReference(reference: string): Promise<BillingEventRow | null> {
        const result = await query(
            `SELECT * FROM billing_events WHERE reference = $1 LIMIT 1`,
            [reference]
        );
        return result.rows[0] ?? null;
    },
};
