import { Request, Response, NextFunction } from 'express';
import { getLimits } from '../config/plans';
import { query } from '../config/database';

export const checkQuota = (resource: 'clients' | 'templates' | 'invoices') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const plan = req.user?.plan || 'free';
        const limits = getLimits(plan);

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        try {
            let count = 0;
            if (resource === 'clients') {
                const result = await query('SELECT COUNT(*) FROM clients WHERE user_id = $1', [userId]);
                count = Number.parseInt(result.rows[0].count);
                if (count >= limits.maxClients) {
                    res.status(403).json({
                        error: `Quota exceeded: You have reached the limit of ${limits.maxClients} clients for the ${plan} plan.`,
                        code: 'QUOTA_EXCEEDED'
                    });
                    return;
                }
            } else if (resource === 'templates') {
                const result = await query('SELECT COUNT(*) FROM templates WHERE user_id = $1', [userId]);
                count = Number.parseInt(result.rows[0].count);
                if (count >= limits.maxTemplates) {
                    res.status(403).json({
                        error: `Quota exceeded: You have reached the limit of ${limits.maxTemplates} templates for the ${plan} plan.`,
                        code: 'QUOTA_EXCEEDED'
                    });
                    return;
                }
            } else if (resource === 'invoices') {
                // Check invoices created in current month
                const result = await query(
                    `SELECT COUNT(*) FROM invoices 
                     WHERE user_id = $1 
                     AND created_at >= date_trunc('month', now())`,
                    [userId]
                );
                count = Number.parseInt(result.rows[0].count);
                if (count >= limits.maxInvoicesPerMonth) {
                    res.status(403).json({
                        error: `Quota exceeded: You have reached the limit of ${limits.maxInvoicesPerMonth} invoices this month for the ${plan} plan.`,
                        code: 'QUOTA_EXCEEDED'
                    });
                    return;
                }
            }

            next();
        } catch (err) {
            console.error('Quota check error:', err);
            res.status(500).json({ error: 'Internal server error during quota check' });
        }
    };
};

export const checkFeature = (feature: keyof Omit<import('../config/plans').PlanLimits, 'maxClients' | 'maxTemplates' | 'maxInvoicesPerMonth'>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const plan = req.user?.plan || 'free';
        const limits = getLimits(plan);

        if (!limits[feature]) {
            res.status(403).json({
                error: `Feature restricted: The ${feature} feature is only available on higher plans. Please upgrade to Pro.`,
                code: 'FEATURE_RESTRICTED'
            });
            return;
        }

        next();
    };
};
