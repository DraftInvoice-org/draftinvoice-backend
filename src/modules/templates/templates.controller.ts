import { Request, Response } from 'express';
import { templatesRepository } from './templates.repository';

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await templatesRepository.findAll();
        res.json(templates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
};

export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const template = await templatesRepository.findById(id);
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        res.json(template);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { id, name, background, blocks } = req.body;
        const userId = req.user?.id || null; // Optional ownership

        const template = await templatesRepository.upsert(id, name, background, blocks, userId);
        res.json(template);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save template' });
    }
};
