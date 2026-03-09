import express from 'express';
import cors from 'cors';
import { env } from './config/env';

// Modules
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import invoiceRoutes from './modules/invoices/invoices.routes';
import templateRoutes from './modules/templates/templates.routes';
import clientRoutes from './modules/clients/clients.routes';
import smtpRoutes from './modules/smtp/smtp.routes';
import billingRoutes from './modules/billing/billing.routes';
import kycRoutes from './modules/kyc/kyc.routes';
import downloadRoutes from './modules/downloads/downloads.routes';
import apiKeyRoutes from './modules/apikeys/apikey.routes';
import { startOverdueCron } from './jobs/markOverdue';
import v1Routes from './api/v1/routes';
import path from 'node:path';

const app = express();

app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve static files for generated PDFs
app.use('/public', express.static(path.join(__dirname, '../public')));

// Mount B2B API V1
app.use('/api/v1', v1Routes);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/smtp-config', smtpRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/apikeys', apiKeyRoutes);
app.use('/api/download', downloadRoutes);

startOverdueCron();

app.listen(env.PORT, () => {
    console.log(`Backend server running at http://localhost:${env.PORT}`);
});
