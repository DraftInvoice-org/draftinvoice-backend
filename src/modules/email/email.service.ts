import nodemailer from 'nodemailer';
import { smtpService } from '../smtp/smtp.service';
import { buildInvoiceEmailHtml } from './email.templates';

interface PlatformSmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
}

interface SendInvoiceEmailOptions {
    userId: string;          // Used to look up custom SMTP config if Pro
    to: string;
    subject: string;
    clientName: string;
    invoiceNumber: string | null;
    amountDue: number | null;
    dueDate: string | null;
    senderName: string;
    note?: string;
    pdfBase64: string;
    filename: string;
}

/** Returns the Nodemailer transporter — custom SMTP for Pro users, platform default otherwise. */
async function getTransporter(userId: string): Promise<{ transporter: nodemailer.Transporter; fromAddress: string; fromName: string }> {
    const customConfig = await smtpService.getDecryptedConfig(userId);

    if (customConfig) {
        return {
            transporter: nodemailer.createTransport({
                host: customConfig.host,
                port: customConfig.port,
                secure: customConfig.secure,
                auth: { user: customConfig.username, pass: customConfig.password },
            }),
            fromAddress: customConfig.from_email,
            fromName: customConfig.from_name ?? 'DraftInvoice',
        };
    }

    // Development: use Ethereal test account so no real emails are sent
    if (process.env.NODE_ENV !== 'production') {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        return { transporter, fromAddress: testAccount.user, fromName: 'DraftInvoice (Dev)' };
    }

    // Production: use platform SMTP from environment
    const platformConfig: PlatformSmtpConfig = {
        host: process.env.SMTP_HOST ?? '',
        port: Number.parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER ?? '',
            pass: process.env.SMTP_PASS ?? '',
        },
    };

    return {
        transporter: nodemailer.createTransport(platformConfig),
        fromAddress: process.env.SMTP_FROM_EMAIL ?? 'noreply@draftinvoice.io',
        fromName: process.env.SMTP_FROM_NAME ?? 'DraftInvoice',
    };
}

export const emailService = {
    async sendInvoiceEmail(opts: SendInvoiceEmailOptions): Promise<void> {
        const { transporter, fromAddress, fromName } = await getTransporter(opts.userId);

        const html = buildInvoiceEmailHtml({
            clientName: opts.clientName,
            invoiceNumber: opts.invoiceNumber,
            amountDue: opts.amountDue,
            dueDate: opts.dueDate,
            senderName: opts.senderName,
            note: opts.note,
        });

        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to: opts.to,
            subject: opts.subject,
            html,
            attachments: [{
                filename: opts.filename,
                content: Buffer.from(opts.pdfBase64, 'base64'),
                contentType: 'application/pdf',
            }],
        });

        // In dev, log the Ethereal preview URL so the developer can inspect the email
        if (process.env.NODE_ENV !== 'production') {
            console.log('[Email] Preview URL:', nodemailer.getTestMessageUrl(info));
        }
    },
};
