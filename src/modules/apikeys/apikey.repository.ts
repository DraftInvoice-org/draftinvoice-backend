import { query } from '../../config/database';

export interface ApiKey {
    id: string;
    user_id: string;
    name: string;
    key_prefix: string;
    key_hash: string;
    last_used_at: Date | null;
    created_at: Date;
}

export const apiKeyRepository = {
    async create(userId: string, name: string, keyPrefix: string, keyHash: string): Promise<ApiKey> {
        const result = await query(
            `INSERT INTO api_keys (user_id, name, key_prefix, key_hash) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [userId, name, keyPrefix, keyHash]
        );
        return result.rows[0];
    },

    async getUserKeys(userId: string): Promise<Omit<ApiKey, 'key_hash'>[]> {
        const result = await query(
            `SELECT id, user_id, name, key_prefix, last_used_at, created_at 
             FROM api_keys 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    },

    async revokeKey(id: string, userId: string): Promise<boolean> {
        const result = await query(
            `DELETE FROM api_keys WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return (result.rowCount ?? 0) > 0;
    },

    async findByPrefix(keyPrefix: string): Promise<ApiKey | null> {
        const result = await query(
            `SELECT * FROM api_keys WHERE key_prefix = $1`,
            [keyPrefix]
        );
        return result.rows[0] || null;
    },

    async updateLastUsed(id: string): Promise<void> {
        await query(
            `UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );
    }
};
