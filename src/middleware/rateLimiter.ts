import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

const GUEST_LIMIT = 5;
const AUTH_LIMIT = 50;
const WINDOW_MINUTES = 60;

export const checkDownloadLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

        if (req.user) {
            // Authenticated: limit by user_id
            const result = await query(
                `SELECT COUNT(*) FROM downloads
                 WHERE user_id = $1 AND created_at > $2`,
                [req.user.id, windowStart]
            );
            const count = parseInt(result.rows[0].count, 10);
            if (count >= AUTH_LIMIT) {
                res.status(429).json({
                    error: 'Download limit reached.',
                    message: `You've reached your ${AUTH_LIMIT} downloads per hour limit.`,
                });
                return;
            }
        } else {
            // Guest: limit by IP
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const result = await query(
                `SELECT COUNT(*) FROM downloads
                 WHERE ip_address = $1 AND user_id IS NULL AND created_at > $2`,
                [ip, windowStart]
            );
            const count = parseInt(result.rows[0].count, 10);
            if (count >= GUEST_LIMIT) {
                res.status(429).json({
                    error: 'Download limit reached.',
                    message: `You've reached the free download limit. Create an account to continue.`,
                    limitReached: true,
                });
                return;
            }
        }

        next();
    } catch (err) {
        console.error('Rate limit check failed:', err);
        next(); // Fail open — don't block downloads on DB error
    }
};
