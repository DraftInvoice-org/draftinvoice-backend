import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { smtpRepository } from './smtp.repository';

const ENCRYPTION_KEY = process.env.SMTP_ENCRYPTION_KEY || '';
// AES-256-GCM: authenticated encryption — provides both confidentiality and
// integrity. The auth tag prevents ciphertext tampering (fixes SonarQube S5542).
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV is recommended for GCM

/** Returns `iv:authTag:ciphertext` (all hex-encoded). */
function encrypt(text: string): string {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = (cipher).getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/** Decrypts a value produced by `encrypt()`. Throws if the auth tag is invalid. */
function decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    (decipher).setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

export const smtpService = {
    async getDecryptedConfig(userId: string) {
        const row = await smtpRepository.findByUserId(userId);
        if (!row) return null;
        return {
            ...row,
            password: decrypt(row.password_encrypted),
        };
    },

    async saveConfig(userId: string, data: {
        host: string; port: number; secure: boolean;
        username: string; password: string; from_name?: string; from_email: string;
    }) {
        const encrypted = encrypt(data.password);
        return smtpRepository.upsert(userId, {
            host: data.host,
            port: data.port,
            secure: data.secure,
            username: data.username,
            password_encrypted: encrypted,
            from_name: data.from_name ?? null,
            from_email: data.from_email,
        });
    },

    async verifyConnection(data: {
        host: string; port: number; secure: boolean;
        username: string; password: string;
    }): Promise<boolean> {
        const transporter = nodemailer.createTransport({
            host: data.host,
            port: data.port,
            secure: data.secure,
            auth: { user: data.username, pass: data.password },
        });
        try {
            await transporter.verify();
            return true;
        } catch {
            return false;
        }
    },

    async deleteConfig(userId: string) {
        return smtpRepository.deleteByUserId(userId);
    },

    /**
     * Sends an email using the PLATFORM system SMTP settings.
     * Used for password resets, system alerts, etc.
     */
    async sendSystemEmail(to: string, subject: string, html: string) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const fromName = process.env.SMTP_FROM_NAME || 'DraftInvoice';
        const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@draftinvoice.com';

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html,
        });
    }
};
