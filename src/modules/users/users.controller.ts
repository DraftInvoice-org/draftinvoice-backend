import { Request, Response } from 'express';
import { usersRepository } from './users.repository';

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await usersRepository.findById(req.user!.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ id: user.id, email: user.email, plan: user.plan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const deleteMe = async (req: Request, res: Response) => {
    try {
        await usersRepository.deleteUser(req.user!.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Account Deletion Error:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};
