import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../modules/apikeys/apikey.service';
import { AuthPayload } from './authMiddleware';

export interface ApiRequest extends Request {
    user?: AuthPayload;
    apiKeyId?: string;
}

export const requireApiKey = async (req: ApiRequest, res: Response, next: NextFunction) => {
    try {
        let apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                apiKey = authHeader.split(' ')[1];
            }
        }

        if (!apiKey) {
            return res.status(401).json({ success: false, message: 'API Key is missing.' });
        }

        const verification = await apiKeyService.validateKey(apiKey);
        if (!verification.isValid || !verification.userId) {
            return res.status(401).json({ success: false, message: 'Invalid API Key.' });
        }

        req.user = {
            id: verification.userId,
            email: 'api-key-user',
            plan: 'pro'
        };
        req.apiKeyId = verification.apiKeyId;

        next();
    } catch (error) {
        console.error('API Key Auth Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
};
