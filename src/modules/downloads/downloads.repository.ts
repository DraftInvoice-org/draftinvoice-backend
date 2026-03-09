import { query } from '../../config/database';

export const downloadsRepository = {
    async recordDownload(ipAddress: string, userId: string | null, invoiceId?: string, source: 'web' | 'api' = 'web'): Promise<void> {
        await query(
            `INSERT INTO downloads (ip_address, user_id, invoice_id, source)
             VALUES ($1, $2, $3, $4)`,
            [ipAddress, userId, invoiceId || null, source]
        );
    }
};
