import pool from '../../config/database';

export interface SmtpConfigRow {
    id: string;
    user_id: string;
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password_encrypted: string;
    from_name: string | null;
    from_email: string;
    created_at: string;
}

export const smtpRepository = {
    async findByUserId(userId: string): Promise<SmtpConfigRow | null> {
        const result = await pool.query(
            `SELECT * FROM smtp_configs WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0] ?? null;
    },

    async upsert(userId: string, data: Omit<SmtpConfigRow, 'id' | 'user_id' | 'created_at'>): Promise<SmtpConfigRow> {
        const result = await pool.query(
            `INSERT INTO smtp_configs (user_id, host, port, secure, username, password_encrypted, from_name, from_email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (user_id) DO UPDATE SET
         host = EXCLUDED.host, port = EXCLUDED.port, secure = EXCLUDED.secure,
         username = EXCLUDED.username, password_encrypted = EXCLUDED.password_encrypted,
         from_name = EXCLUDED.from_name, from_email = EXCLUDED.from_email
       RETURNING *`,
            [userId, data.host, data.port, data.secure, data.username, data.password_encrypted, data.from_name ?? null, data.from_email]
        );
        return result.rows[0];
    },

    async deleteByUserId(userId: string): Promise<boolean> {
        const result = await pool.query(`DELETE FROM smtp_configs WHERE user_id = $1`, [userId]);
        return (result.rowCount ?? 0) > 0;
    },
};
