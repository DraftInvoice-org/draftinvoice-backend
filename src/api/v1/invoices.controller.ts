import { Response } from 'express';
import { ApiRequest } from '../../middleware/apiKeyAuth';
import { templatesRepository } from '../../modules/templates/templates.repository';
import { invoiceQueue } from '../../jobs/invoiceQueue';
import { downloadsRepository } from '../../modules/downloads/downloads.repository';
import fs from 'node:fs';
import path from 'node:path';

export const createInvoiceV1 = async (req: ApiRequest, res: Response) => {
    try {
        const { template_id, overrides } = req.body;

        if (!template_id) {
            return res.status(400).json({ success: false, message: 'template_id is required' });
        }

        const template = await templatesRepository.findById(template_id);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        // Verify template ownership
        if (template.user_id !== req.user?.id) {
            return res.status(403).json({ success: false, message: 'You do not have access to this template' });
        }

        // Dispatch to BullMQ Queue
        const jobName = 'generate-invoice' as const;
        const job = await invoiceQueue.add(jobName, {
            template_id,
            overrides: overrides || {},
            user_id: req.user?.id
        });

        // Return a 202 Accepted status
        const host = req.get('host') || 'localhost:3001';
        const protocol = req.protocol || 'http';
        const statusUrl = `${protocol}://${host}/api/v1/invoices/${job.id}`;

        return res.status(202).json({
            success: true,
            message: 'Invoice generation queued successfully',
            data: {
                invoice_id: job.id,
                status_url: statusUrl
            }
        });
    } catch (error) {
        console.error('V1 Create Invoice Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while queueing invoice generation' });
    }
};

export const getInvoiceStatusV1 = async (req: ApiRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const job = await invoiceQueue.getJob(id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Invoice generation job not found' });
        }

        // Verify ownership 
        if (job.data.user_id !== req.user?.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this invoice job' });
        }

        const isCompleted = await job.isCompleted();
        const isFailed = await job.isFailed();

        if (isCompleted) {
            const result = job.returnvalue as { pdf_url: string, invoice_id: string } | null;

            // Construct full URL since the worker returned a relative one
            const host = req.get('host') || 'localhost:3001';
            const protocol = req.protocol || 'http';
            const fullPdfUrl = result?.pdf_url ? `${protocol}://${host}${result.pdf_url}` : null;

            return res.status(200).json({
                success: true,
                status: 'completed',
                data: {
                    invoice_id: id,
                    pdf_url: fullPdfUrl
                }
            });
        }

        if (isFailed) {
            return res.status(200).json({
                success: false,
                status: 'failed',
                message: job.failedReason || 'Invoice generation failed'
            });
        }

        return res.status(200).json({
            success: true,
            status: 'processing',
            message: 'Invoice is currently being generated'
        });

    } catch (error) {
        console.error('V1 Get Invoice Status Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while fetching invoice status' });
    }
};

export const downloadInvoiceV1 = async (req: ApiRequest, res: Response) => {
    try {
        const { id } = req.params;
        const filename = `${id}.pdf`;
        const filePath = path.join(__dirname, '../../../public/pdfs', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Invoice PDF not found' });
        }

        // Record the download
        const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
        const ip = (Array.isArray(rawIp) ? rawIp[0] : rawIp) as string;

        // Note: For public shared links, req.user will be null, which is expected.
        await downloadsRepository.recordDownload(ip, req.user?.id || null, id as string, 'api');

        // Serve the file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('V1 Download Invoice Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while serving invoice' });
    }
};
