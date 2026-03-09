import { query } from '../../config/database';

export interface TemplateRow {
    id: string;
    user_id: string | null;
    name: string;
    background: string | null;
    blocks: any;
    created_at: string;
    updated_at: string;
}

export const templatesRepository = {
    async findAll(): Promise<TemplateRow[]> {
        const result = await query('SELECT * FROM templates ORDER BY created_at DESC');
        return result.rows;
    },

    async findById(id: string): Promise<TemplateRow | null> {
        const result = await query('SELECT * FROM templates WHERE id = $1', [id]);
        return result.rows[0] ?? null;
    },

    async upsert(id: string, name: string, background: string | null, blocks: any, userId: string | null): Promise<TemplateRow> {
        const result = await query(
            `INSERT INTO templates (id, name, background, blocks, user_id, updated_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE
             SET name = EXCLUDED.name,
                 background = EXCLUDED.background,
                 blocks = EXCLUDED.blocks,
                 user_id = COALESCE(templates.user_id, EXCLUDED.user_id),
                 updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [id, name, background, JSON.stringify(blocks), userId]
        );
        return result.rows[0];
    }
};
