export interface PlanLimits {
    maxClients: number;
    maxTemplates: number;
    maxInvoicesPerMonth: number;
    allowApiKeys: boolean;
    allowCustomSmtp: boolean;
    allowPremiumTemplates: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
    free: {
        maxClients: 5,
        maxTemplates: 3,
        maxInvoicesPerMonth: 10,
        allowApiKeys: false,
        allowCustomSmtp: false,
        allowPremiumTemplates: false,
    },
    pro: {
        maxClients: 100,
        maxTemplates: 20,
        maxInvoicesPerMonth: 1000,
        allowApiKeys: true,
        allowCustomSmtp: true,
        allowPremiumTemplates: true,
    }
};

export function getLimits(plan: string): PlanLimits {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}
