import { kycRepository, BusinessVerification } from './kyc.repository';

export const kycService = {
    async getStatus(userId: string) {
        return kycRepository.findByUserId(userId);
    },

    async submitVerification(userId: string, data: Partial<BusinessVerification>) {
        return kycRepository.upsert(userId, data);
    }
};
