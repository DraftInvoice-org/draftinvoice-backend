import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthPayload {
    id: string;
    email: string;
    plan: string;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

/** Requires a valid JWT — returns 401 if missing or invalid. */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;

        // 🚀 CRITICAL: Fetch fresh user data from DB to avoid "stale" plan in JWT
        const { query } = require('../config/database');
        const result = await query('SELECT email, plan FROM users WHERE id = $1', [payload.id]);

        if (result.rows.length === 0) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        req.user = {
            id: payload.id,
            email: result.rows[0].email,
            plan: result.rows[0].plan
        };
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/** Optionally parses the JWT — does NOT reject unauthenticated requests. */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        const token = header.slice(7);
        try {
            const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
            req.user = payload;
        } catch {
            // ignore invalid tokens for optional auth
        }
    }
    next();
};
