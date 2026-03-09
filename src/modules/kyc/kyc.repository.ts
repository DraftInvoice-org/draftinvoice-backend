import { query } from '../../config/database';

export interface BusinessVerification {
    id: string;
    user_id: string;
    business_name: string;
    registration_number: string;
    business_address: string;
    document_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    reviewed_at?: string;
    created_at: string;
    updated_at: string;
}

export const kycRepository = {
    async findByUserId(userId: string): Promise<BusinessVerification | null> {
        const result = await query(
            'SELECT * FROM business_verifications WHERE user_id = $1 LIMIT 1',
            [userId]
        );
        return result.rows[0] ?? null;
    },

    async upsert(userId: string, data: Partial<BusinessVerification>): Promise<BusinessVerification> {
        const result = await query(
            `INSERT INTO business_verifications (
                user_id, business_name, registration_number, business_address, document_url, status
            ) VALUES ($1, $2, $3, $4, $5, 'pending')
            ON CONFLICT (user_id) DO UPDATE SET
                business_name = EXCLUDED.business_name,
                registration_number = EXCLUDED.registration_number,
                business_address = EXCLUDED.business_address,
                document_url = COALESCE(EXCLUDED.document_url, business_verifications.document_url),
                status = 'pending',
                updated_at = CURRENT_TIMESTAMP
            RETURNING *`,
            [
                userId,
                data.business_name,
                data.registration_number,
                data.business_address,
                data.document_url
            ]
        );
        return result.rows[0];
    },

    async updateStatus(id: string, status: string, notes?: string): Promise<void> {
        await query(
            `UPDATE business_verifications 
             SET status = $1, admin_notes = $2, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3`,
            [status, notes, id]
        );
    }
};
