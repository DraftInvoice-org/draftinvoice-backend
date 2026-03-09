import { query } from '../../config/database';

export interface UserRow {
    id: string;
    email: string;
    password_hash: string;
    plan: string;
    created_at: string;
    updated_at: string;
}

export const authRepository = {
    async findByEmail(email: string): Promise<UserRow | null> {
        const result = await query(
            'SELECT * FROM users WHERE email = $1 LIMIT 1',
            [email]
        );
        return result.rows[0] ?? null;
    },

    async createUser(email: string, passwordHash: string): Promise<UserRow> {
        const result = await query(
            `INSERT INTO users (email, password_hash)
             VALUES ($1, $2)
             RETURNING *`,
            [email, passwordHash]
        );
        return result.rows[0];
    },

    async findById(id: string): Promise<UserRow | null> {
        const result = await query(
            'SELECT * FROM users WHERE id = $1 LIMIT 1',
            [id]
        );
        return result.rows[0] ?? null;
    },

    async createResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
        await query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [userId, token, expiresAt]
        );
    },

    async findValidToken(token: string): Promise<{ user_id: string; id: string } | null> {
        const result = await query(
            `SELECT user_id, id FROM password_reset_tokens
             WHERE token = $1 AND expires_at > NOW() AND used = FALSE
             LIMIT 1`,
            [token]
        );
        return result.rows[0] ?? null;
    },

    async markTokenAsUsed(tokenId: string): Promise<void> {
        await query(
            `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
            [tokenId]
        );
    },

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        await query(
            `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [passwordHash, userId]
        );
    }
};
