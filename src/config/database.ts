import { Pool } from 'pg';
import { env } from './env';

const pool = new Pool(
    env.DATABASE_URL
        ? {
            connectionString: env.DATABASE_URL,
            ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        }
        : {
            host: env.DB_HOST,
            port: env.DB_PORT,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
        }
);

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
