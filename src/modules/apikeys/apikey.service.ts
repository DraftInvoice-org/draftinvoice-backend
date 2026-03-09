import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { apiKeyRepository, ApiKey } from './apikey.repository';

const SALT_ROUNDS = 10;
const PREFIX = 'drft_live_';

export const apiKeyService = {
    async createKey(userId: string, name: string): Promise<{ rawKey: string, apiKey: ApiKey }> {
        // 1. Generate random 32 bytes securely
        const randomBytes = crypto.randomBytes(32).toString('hex'); // 64 chars

        // 2. Format raw key
        const rawKey = `${PREFIX}${randomBytes}`;

        // 3. Extract prefix (for UI display, e.g. "drft_live_a1b2c3d4")
        const keyPrefix = rawKey.substring(0, PREFIX.length + 8);

        // 4. Hash the raw key for secure storage
        const keyHash = await bcrypt.hash(rawKey, SALT_ROUNDS);

        // 5. Store in DB
        const apiKey = await apiKeyRepository.create(userId, name, keyPrefix, keyHash);

        return { rawKey, apiKey };
    },

    async getUserKeys(userId: string) {
        return await apiKeyRepository.getUserKeys(userId);
    },

    async revokeKey(id: string, userId: string) {
        return await apiKeyRepository.revokeKey(id, userId);
    },

    async validateKey(rawKey: string): Promise<{ isValid: boolean, userId?: string, apiKeyId?: string }> {
        if (!rawKey.startsWith(PREFIX)) return { isValid: false };

        const prefixToMatch = rawKey.substring(0, PREFIX.length + 8);
        const apiKey = await apiKeyRepository.findByPrefix(prefixToMatch);

        if (!apiKey) return { isValid: false };

        const isMatch = await bcrypt.compare(rawKey, apiKey.key_hash);

        if (isMatch) {
            // Asynchronously update last used timestamp
            apiKeyRepository.updateLastUsed(apiKey.id).catch(console.error);
            return { isValid: true, userId: apiKey.user_id, apiKeyId: apiKey.id };
        }

        return { isValid: false };
    }
};
