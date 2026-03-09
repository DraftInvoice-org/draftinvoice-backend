import pool from '../../config/database';
import { ClientRecord } from '../../types/shared';

export const clientsRepository = {
    async findAllByUserId(userId: string): Promise<ClientRecord[]> {
        const result = await pool.query(
            `SELECT * FROM clients WHERE user_id = $1 ORDER BY company_name ASC`,
            [userId]
        );
        return result.rows;
    },

    async findById(id: string, userId: string): Promise<ClientRecord | null> {
        const result = await pool.query(
            `SELECT * FROM clients WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return result.rows[0] ?? null;
    },

    async create(
        userId: string,
        data: Omit<ClientRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ): Promise<ClientRecord> {
        const result = await pool.query(
            `INSERT INTO clients
        (user_id, company_name, contact_name, email, phone,
         address_line1, address_line2, city, state, zip, country, tax_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
            [
                userId, data.company_name, data.contact_name ?? null,
                data.email ?? null, data.phone ?? null,
                data.address_line1 ?? null, data.address_line2 ?? null,
                data.city ?? null, data.state ?? null, data.zip ?? null,
                data.country ?? 'NG', data.tax_id ?? null,
            ]
        );
        return result.rows[0];
    },

    async update(
        id: string,
        userId: string,
        data: Partial<Omit<ClientRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<ClientRecord | null> {
        const fields = Object.keys(data);
        if (fields.length === 0) return this.findById(id, userId);

        const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');
        const values = fields.map((f) => (data as Record<string, unknown>)[f]);

        const result = await pool.query(
            `UPDATE clients SET ${setClause}, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
            [id, userId, ...values]
        );
        return result.rows[0] ?? null;
    },

    async deleteById(id: string, userId: string): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM clients WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return (result.rowCount ?? 0) > 0;
    },
};
