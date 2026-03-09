import { Request, Response } from 'express';
import { clientsRepository } from './clients.repository';
import { z } from 'zod';

const ClientSchema = z.object({
    company_name: z.string().min(1, 'Company name is required'),
    contact_name: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    tax_id: z.string().optional(),
});

export const createClient = async (req: Request, res: Response) => {
    // Plan check: only Pro users can manage clients
    if (req.user!.plan !== 'pro') {
        res.status(403).json({ error: 'Client management requires a Pro plan', code: 'PLAN_REQUIRED' });
        return;
    }
    const parsed = ClientSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
    }
    try {
        const client = await clientsRepository.create(req.user!.id, parsed.data as any);
        res.status(201).json(client);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create client' });
    }
};

export const getClients = async (req: Request, res: Response) => {
    try {
        const clients = await clientsRepository.findAllByUserId(req.user!.id);
        res.json(clients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

export const getClient = async (req: Request, res: Response) => {
    try {
        const client = await clientsRepository.findById(req.params.id, req.user!.id);
        if (!client) { res.status(404).json({ error: 'Client not found' }); return; }
        res.json(client);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch client' });
    }
};

export const updateClient = async (req: Request, res: Response) => {
    const parsed = ClientSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
    }
    try {
        const client = await clientsRepository.update(req.params.id, req.user!.id, parsed.data as any);
        if (!client) { res.status(404).json({ error: 'Client not found' }); return; }
        res.json(client);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update client' });
    }
};

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const deleted = await clientsRepository.deleteById(req.params.id, req.user!.id);
        if (!deleted) { res.status(404).json({ error: 'Client not found' }); return; }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete client' });
    }
};
