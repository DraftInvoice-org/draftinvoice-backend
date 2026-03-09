import pool from '../../config/database';
import { InvoiceRecord, ClientSnapshot } from '../../types/shared';

export const invoicesRepository = {
    async create(
        userId: string,
        title: string,
        invoiceData: unknown,
        options?: {
            clientId?: string;
            clientSnapshot?: ClientSnapshot;
            invoiceNumber?: string;
            amountDue?: number;
            dueDate?: string;
        }
    ): Promise<InvoiceRecord> {
        const result = await pool.query(
            `INSERT INTO invoices
        (user_id, title, invoice_data, client_id, client_snapshot, invoice_number, amount_due, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
            [
                userId, title, JSON.stringify(invoiceData),
                options?.clientId ?? null,
                options?.clientSnapshot ? JSON.stringify(options.clientSnapshot) : null,
                options?.invoiceNumber ?? null,
                options?.amountDue ?? null,
                options?.dueDate ?? null,
            ]
        );
        return result.rows[0];
    },

    async findByUserId(userId: string): Promise<InvoiceRecord[]> {
        const result = await pool.query(
            `SELECT * FROM invoices WHERE user_id = $1 ORDER BY updated_at DESC`,
            [userId]
        );
        return result.rows;
    },

    async findById(id: string, userId: string): Promise<InvoiceRecord | null> {
        const result = await pool.query(
            `SELECT * FROM invoices WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return result.rows[0] ?? null;
    },

    async update(
        id: string,
        userId: string,
        title: string,
        invoiceData: unknown,
        status: string,
        options?: {
            clientId?: string | null;
            clientSnapshot?: ClientSnapshot | null;
            invoiceNumber?: string | null;
            amountDue?: number | null;
            dueDate?: string | null;
        }
    ): Promise<InvoiceRecord | null> {
        const result = await pool.query(
            `UPDATE invoices
       SET title=$1, invoice_data=$2, status=$3,
           client_id=$4, client_snapshot=$5, invoice_number=$6,
           amount_due=$7, due_date=$8, updated_at=NOW()
       WHERE id=$9 AND user_id=$10
       RETURNING *`,
            [
                title, JSON.stringify(invoiceData), status,
                options?.clientId ?? null,
                options?.clientSnapshot ? JSON.stringify(options.clientSnapshot) : null,
                options?.invoiceNumber ?? null,
                options?.amountDue ?? null,
                options?.dueDate ?? null,
                id, userId,
            ]
        );
        return result.rows[0] ?? null;
    },

    async markPaid(id: string, userId: string): Promise<InvoiceRecord | null> {
        const result = await pool.query(
            `UPDATE invoices SET payment_status='paid', updated_at=NOW()
       WHERE id=$1 AND user_id=$2
       RETURNING *`,
            [id, userId]
        );
        return result.rows[0] ?? null;
    },

    async markLastSent(id: string): Promise<void> {
        await pool.query(
            `UPDATE invoices SET last_sent_at=NOW(), status='sent', updated_at=NOW() WHERE id=$1`,
            [id]
        );
    },

    /** Bulk-sets overdue status on all past-due unpaid invoices. Called by the cron job. */
    async markOverdueBatch(): Promise<number> {
        const result = await pool.query(
            `UPDATE invoices
       SET payment_status='overdue', updated_at=NOW()
       WHERE due_date < CURRENT_DATE
         AND payment_status = 'unpaid'`
        );
        return result.rowCount ?? 0;
    },

    async delete(id: string, userId: string): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM invoices WHERE id=$1 AND user_id=$2`,
            [id, userId]
        );
        return (result.rowCount ?? 0) > 0;
    },
};
