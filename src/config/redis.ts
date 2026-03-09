import { Redis } from 'ioredis';
import { env } from './env';

// Fallback to localhost if no external Redis provided (Upstash)
const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

const isTls = redisUrl.startsWith('rediss://');

export const redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    tls: isTls ? { rejectUnauthorized: false } : undefined
});

redisConnection.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
    console.log('Connected to Redis server.');
});
