import { Request, Response } from 'express';
import { invoicesRepository } from './invoices.repository';
import { emailService } from '../email/email.service';
import { z } from 'zod';


const InvoiceSchema = z.object({
    title: z.string().optional().default('Untitled Invoice'),
    invoice_data: z.any(), // Consider a more specific schema if structure is known
    status: z.string().optional().default('draft'),
    client_id: z.uuid().optional().nullable(),
    invoice_number: z.string().optional().nullable(),
    amount_due: z.number().optional().nullable(),
    due_date: z.string().optional().nullable(), // ISO date string
});

const SendEmailSchema = z.object({
    pdfBase64: z.string().min(1, 'PDF data is required'),
    filename: z.string().default('invoice.pdf'),
    note: z.string().optional(),
});

export const createInvoice = async (req: Request, res: Response) => {
    const parsed = InvoiceSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Invalid invoice data' }); return; }
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; } // Ensure user is authenticated
    try {
        const invoice = await invoicesRepository.create(
            req.user.id, parsed.data.title, parsed.data.invoice_data,
            { clientId: parsed.data.client_id ?? undefined, invoiceNumber: parsed.data.invoice_number ?? undefined, amountDue: parsed.data.amount_due ?? undefined, dueDate: parsed.data.due_date ?? undefined }
        );
        res.status(201).json(invoice);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create invoice' }); }
};

export const getInvoices = async (req: Request, res: Response) => {
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    try {
        res.json(await invoicesRepository.findByUserId(req.user.id));
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch invoices' }); }
};

export const getInvoiceById = async (req: Request, res: Response) => {
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    try {
        const invoice = await invoicesRepository.findById(req.params.id as string, req.user.id);
        if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }
        res.json(invoice);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch invoice' }); }
};

export const updateInvoice = async (req: Request, res: Response) => {
    const parsed = InvoiceSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Invalid invoice data' }); return; }
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    try {
        const invoice = await invoicesRepository.update(
            req.params.id as string, req.user.id, parsed.data.title, parsed.data.invoice_data, parsed.data.status,
            { clientId: parsed.data.client_id, invoiceNumber: parsed.data.invoice_number, amountDue: parsed.data.amount_due, dueDate: parsed.data.due_date }
        );
        if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }
        res.json(invoice);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update invoice' }); }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    try {
        const success = await invoicesRepository.delete(req.params.id as string, req.user.id);
        if (!success) { res.status(404).json({ error: 'Invoice not found' }); return; }
        res.status(204).send();
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete invoice' }); }
};

export const markInvoicePaid = async (req: Request, res: Response) => {
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    try {
        const invoice = await invoicesRepository.markPaid(req.params.id as string, req.user.id);
        if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }
        res.json(invoice);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to mark invoice as paid' }); }
};

export const sendInvoiceEmail = async (req: Request, res: Response) => {
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

    if (req.user.plan !== 'pro') {
        res.status(403).json({ error: 'Email dispatch requires a Pro plan', code: 'PLAN_REQUIRED' });
        return;
    }

    const parsed = SendEmailSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0].message }); return; }

    try {
        const invoice = await invoicesRepository.findById(req.params.id as string, req.user.id);
        if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }

        const clientEmail = invoice.client_snapshot?.email;
        if (!clientEmail) {
            res.status(422).json({ error: 'This invoice has no client email address. Please attach a client with a valid email first.' });
            return;
        }
        await emailService.sendInvoiceEmail({
            userId: req.user.id,
            to: clientEmail,
            subject: `Invoice${invoice.invoice_number ? '#' + invoice.invoice_number : ''} from ${req.user.email}`,
            clientName: invoice.client_snapshot?.contact_name ?? invoice.client_snapshot?.company_name ?? 'there',
            invoiceNumber: invoice.invoice_number,
            amountDue: invoice.amount_due,
            dueDate: invoice.due_date,
            senderName: req.user.email,
            note: parsed.data.note,
            pdfBase64: parsed.data.pdfBase64,
            filename: parsed.data.filename,
        });

        await invoicesRepository.markLastSent(invoice.id);
        res.json({ message: 'Invoice sent successfully' });
    } catch (err) {
        console.error('[sendInvoiceEmail]', err);
        res.status(500).json({ error: 'Failed to send invoice email' });
    }
};
