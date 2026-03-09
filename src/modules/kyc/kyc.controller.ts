import { Request, Response } from 'express';
import { kycService } from './kyc.service';

export const getKycStatus = async (req: Request, res: Response) => {
    try {
        const status = await kycService.getStatus(req.user!.id);
        res.json(status);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch KYC status' });
    }
};

export const submitKyc = async (req: Request, res: Response) => {
    const { business_name, registration_number, business_address, document_url } = req.body;

    if (!business_name || !registration_number || !business_address) {
        res.status(400).json({ error: 'Missing required business details' });
        return;
    }

    try {
        const result = await kycService.submitVerification(req.user!.id, {
            business_name,
            registration_number,
            business_address,
            document_url
        });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit verification' });
    }
};
