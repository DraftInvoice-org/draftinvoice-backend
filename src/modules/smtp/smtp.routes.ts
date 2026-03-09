import { Router, Request, Response } from 'express';
import { smtpService } from './smtp.service';
import { authenticate } from '../../middleware/authMiddleware';
import { checkFeature } from '../../middleware/quotaMiddleware';
import { z } from 'zod';

const router = Router();
router.use(authenticate);
router.use(checkFeature('allowCustomSmtp'));

const SmtpConfigSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.number().int().min(1).max(65535).default(587),
    secure: z.boolean().default(false),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    from_name: z.string().optional(),
    from_email: z.email('Invalid from email'),
});

// GET /api/smtp-config — returns config without the password
router.get('/', async (req: Request, res: Response) => {
    const config = await smtpService.getDecryptedConfig(req.user!.id);
    if (!config) { res.status(404).json({ error: 'No SMTP config found' }); return; }
    // Never return the decrypted password to the client
    const { password: _pw, ...safe } = config;
    res.json({ ...safe, password: '••••••••' });
});

// PUT /api/smtp-config — save (and verify) config
router.put('/', async (req: Request, res: Response) => {
    const parsed = SmtpConfigSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0].message }); return; }

    // Optionally verify before saving (based on query param ?verify=true)
    if (req.query.verify === 'true') {
        const ok = await smtpService.verifyConnection(parsed.data);
        if (!ok) { res.status(422).json({ error: 'Could not connect to SMTP server. Check your credentials.' }); return; }
    }

    try {
        await smtpService.saveConfig(req.user!.id, parsed.data);
        res.json({ message: 'SMTP configuration saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save SMTP config' });
    }
});

// DELETE /api/smtp-config
router.delete('/', async (req: Request, res: Response) => {
    await smtpService.deleteConfig(req.user!.id);
    res.status(204).send();
});

export default router;
