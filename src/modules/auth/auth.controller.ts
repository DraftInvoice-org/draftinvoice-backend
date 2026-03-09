import { Request, Response } from 'express';
import { authService } from './auth.service';
import { SignupSchema, LoginSchema } from './auth.validation';

export const signupHandler = async (req: Request, res: Response) => {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
    }

    try {
        const result = await authService.signup(parsed.data.email, parsed.data.password);
        res.status(201).json(result);
    } catch (err: any) {
        res.status(err.status ?? 500).json({ error: err.message });
    }
};

export const loginHandler = async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
    }

    try {
        const result = await authService.login(parsed.data.email, parsed.data.password);
        res.json(result);
    } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        res.status(e.status ?? 500).json({ error: e.message ?? 'Login failed' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    try {
        const result = await authService.forgotPassword(email);
        res.json(result);
    } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        res.status(e.status ?? 500).json({ error: e.message ?? 'Failed to process request' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (!token || !password) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
    }

    try {
        const result = await authService.resetPassword(token, password);
        res.json(result);
    } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        res.status(e.status ?? 500).json({ error: e.message ?? 'Failed to reset password' });
    }
};

export const logoutHandler = (_req: Request, res: Response) => {
    // JWT is stateless — client discards the token
    res.json({ message: 'Logged out successfully' });
};

export const meHandler = async (req: Request, res: Response) => {
    try {
        const user = await authService.me(req.user!.id);
        res.json(user);
    } catch (err: any) {
        res.status(err.status ?? 500).json({ error: err.message });
    }
};
