import { query } from '../../config/database';

export interface UserRow {
    id: string;
    email: string;
    password_hash: string;
    plan: string;
    created_at: string;
    updated_at: string;
}

export const usersRepository = {
    async findById(id: string): Promise<UserRow | null> {
        const result = await query(
            'SELECT * FROM users WHERE id = $1 LIMIT 1',
            [id]
        );
        return result.rows[0] ?? null;
    },

    async updatePlan(id: string, plan: string): Promise<UserRow | null> {
        const result = await query(
            `UPDATE users SET plan = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [plan, id]
        );
        return result.rows[0] ?? null;
    },

    async deleteUser(id: string): Promise<void> {
        await query('DELETE FROM users WHERE id = $1', [id]);
    }
};
