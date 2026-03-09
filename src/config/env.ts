import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
};

export const env = {
    PORT: process.env.PORT || '3001',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number.parseInt(process.env.DB_PORT || '5432', 10),
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: required('DB_PASSWORD'),
    DB_NAME: process.env.DB_NAME || 'DraftInvoice',
    REDIS_URL: process.env.REDIS_URL, // Added REDIS_URL
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    NODE_ENV: process.env.NODE_ENV || 'development',
};
