import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
};

export const env = {
    PORT: process.env.PORT || '3001',
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number.parseInt(process.env.DB_PORT || '5432', 10),
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME || 'DraftInvoice',
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Microservices
    PDF_WORKER_URL: process.env.PDF_WORKER_URL || 'http://localhost:3000/api/generate',

    // Paystack
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    PRO_PRICE_KOBO: Number(process.env.PRO_PRICE_KOBO || 999900),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // SMTP
    SMTP_ENCRYPTION_KEY: process.env.SMTP_ENCRYPTION_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: Number(process.env.SMTP_PORT || 587),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'DraftInvoice',
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'no-reply@draftinvoice.com',
};
