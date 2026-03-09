import { Request, Response } from 'express';
import { downloadsRepository } from './downloads.repository';

export const downloadHandler = async (req: Request, res: Response) => {
    try {
        const { invoice_id } = req.body;
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userId = req.user?.id || null;

        await downloadsRepository.recordDownload(ip, userId, invoice_id, 'web');

        res.json({ message: 'Download allowed and recorded' });
    } catch (err) {
        console.error('Failed to record download:', err);
        // Still allow the download even if tracking fails, so we don't block user flow
        res.json({ message: 'Download allowed' });
    }
};
