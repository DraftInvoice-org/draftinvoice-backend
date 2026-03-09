import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { authRepository } from './auth.repository';
import { billingRepository } from '../billing/billing.repository';

const SALT_ROUNDS = 12;

function signToken(user: { id: string; email: string; plan: string }) {
    return jwt.sign(
        { id: user.id, email: user.email, plan: user.plan },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN } as any
    );
}

export const authService = {
    async signup(email: string, password: string) {
        const existing = await authRepository.findByEmail(email);
        if (existing) {
            throw Object.assign(new Error('An account with that email already exists'), { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await authRepository.createUser(email, passwordHash);
        const token = signToken(user);

        return {
            token,
            user: { id: user.id, email: user.email, plan: user.plan },
        };
    },

    async login(email: string, password: string) {
        const user = await authRepository.findByEmail(email);
        if (!user) {
            throw Object.assign(new Error('Invalid email or password'), { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            throw Object.assign(new Error('Invalid email or password'), { status: 401 });
        }

        const token = signToken(user);
        return {
            token,
            user: { id: user.id, email: user.email, plan: user.plan },
        };
    },

    async me(userId: string) {
        const user = await authRepository.findById(userId);
        if (!user) {
            throw Object.assign(new Error('User not found'), { status: 404 });
        }
        // Only check for pending payment if user is on free plan (avoids unnecessary query for Pro users)
        const hasPendingPayment = user.plan === 'free'
            ? await billingRepository.hasPending(userId)
            : false;
        return {
            id: user.id,
            email: user.email,
            plan: user.plan,
            has_pending_payment: hasPendingPayment,
        };
    },

    async forgotPassword(email: string) {
        const user = await authRepository.findByEmail(email);
        // We don't want to leak if a user exists or not for security (timing attacks aside)
        // But for a friendly small app, we can just return success either way.
        if (!user) return { success: true };

        const crypto = await import('node:crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await authRepository.createResetToken(user.id, token, expiresAt);

        const { smtpService } = await import('../smtp/smtp.service');
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await smtpService.sendSystemEmail(
            email,
            'Password Reset Request',
            `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password for your DraftInvoice account.</p>
                <p>Click the button below to proceed. This link will expire in 1 hour.</p>
                <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Reset Password
                </a>
                <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>
            `
        );

        return { success: true };
    },

    async resetPassword(token: string, newPassword: string) {
        const resetRecord = await authRepository.findValidToken(token);
        if (!resetRecord) {
            throw Object.assign(new Error('Invalid or expired reset token'), { status: 400 });
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await authRepository.updatePassword(resetRecord.user_id, passwordHash);
        await authRepository.markTokenAsUsed(resetRecord.id);

        return { success: true };
    }
};
