import { Router, Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, role = 'ARTIST' } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name, email, passwordHash, role }
        });

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isPro: user.isPro } });
    } catch {
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true, role: true, avatar: true, bio: true, genre: true, city: true, website: true, instagram: true, facebook: true, twitter: true, youtube: true, spotify: true, isPro: true, profileProgress: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { name, bio, genre, city, website, instagram, facebook, twitter, youtube, spotify, avatar } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: { name, bio, genre, city, website, instagram, facebook, twitter, youtube, spotify, avatar }
        });
        res.json({ id: user.id, name: user.name, avatar: user.avatar });
    } catch {
        res.status(500).json({ error: 'Update failed' });
    }
});

router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Incorrect current password' });

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
        res.json({ success: true, message: 'Password updated' });
    } catch {
        res.status(500).json({ error: 'Password update failed' });
    }
});

export default router;
