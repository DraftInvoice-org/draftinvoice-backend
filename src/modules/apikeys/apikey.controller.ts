import { Request, Response } from 'express';
import { apiKeyService } from './apikey.service';

export const generateApiKey = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'API Key name is required' });
        }

        const { rawKey, apiKey } = await apiKeyService.createKey(userId, name);

        res.status(201).json({
            message: 'API Key generated successfully',
            apiKey,
            rawKey // Only shown once!
        });
    } catch (error) {
        console.error('Error generating API Key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const listApiKeys = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const keys = await apiKeyService.getUserKeys(userId);
        res.status(200).json({ keys });
    } catch (error) {
        console.error('Error listing API Keys:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const revokeApiKey = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const id = req.params.id as string;
        const success = await apiKeyService.revokeKey(id, userId);

        if (success) {
            res.status(200).json({ message: 'API Key revoked successfully' });
        } else {
            res.status(404).json({ error: 'API Key not found or already revoked' });
        }
    } catch (error) {
        console.error('Error revoking API Key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
