import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { env } from '../config/env';
import { templatesRepository } from '../modules/templates/templates.repository';
import { compileTemplateToHtml } from '../utils/htmlCompiler';
import fetch from 'node-fetch';
import fs from 'node:fs';
import path from 'node:path';

export const INVOICE_QUEUE_NAME = 'invoice-generation';

export const invoiceQueue = new Queue<{
    template_id: string;
    overrides: any;
    user_id: string;
}, {
    pdf_url: string;
    invoice_id: string;
}, 'generate-invoice'>(INVOICE_QUEUE_NAME, {
    connection: redisConnection as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: 1000,
        removeOnFail: 1000,
    }
});

// The worker logic to process PDF Generation
export const invoiceWorker = new Worker(INVOICE_QUEUE_NAME, async (job: Job) => {
    const { template_id, overrides, user_id } = job.data;

    const template = await templatesRepository.findById(template_id);
    if (!template) {
        throw new Error('Template not found');
    }

    if (template.user_id !== user_id) {
        throw new Error('Unauthorized template access by worker');
    }

    if (typeof template.blocks === 'string') {
        template.blocks = JSON.parse(template.blocks);
    }

    const html = compileTemplateToHtml(template, overrides || {});

    const workerUrl = env.PDF_WORKER_URL;
    console.log(`[Worker] Dispatching PDF generation request down to microservice, invoice ${job.id}`);

    const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error(`[Worker] Service Error on Job ${job.id}:`, err);
        throw new Error('PDF Generation microservice failed');
    }

    const pdfBuffer = await response.arrayBuffer();

    const publicDir = path.join(__dirname, '../../../public/pdfs');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const filename = `${job.id}.pdf`;
    const filePath = path.join(publicDir, filename);

    fs.writeFileSync(filePath, Buffer.from(pdfBuffer));

    // For a real production system, this would be an S3 or Cloudinary URL.
    // For MVP bootstrapped, returning relative paths which can be constructed by the API.
    const pdf_path = `/api/v1/invoices/${job.id}/download`;

    return {
        pdf_url: pdf_path,
        invoice_id: job.id
    };
}, {
    connection: redisConnection as any,
    concurrency: 5 // Process 5 PDFs in parallel
});

invoiceWorker.on('completed', (job) => {
    console.log(`[Worker] Completed invoice PDF generation for Job ${job.id}`);
});

invoiceWorker.on('failed', (job, err) => {
    console.error(`[Worker] Failed invoice PDF generation for Job ${job?.id}:`, err.message);
});
