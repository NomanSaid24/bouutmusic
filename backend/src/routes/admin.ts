import { Router, Response, Request } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const userCount = await prisma.user.count();
        const songCount = await prisma.song.count();
        const pendingSongs = await prisma.song.count({ where: { status: 'PENDING' } });
        const revenue = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' }});
        
        res.json({ users: userCount, songs: songCount, pendingSongs, revenue: revenue._sum.amount || 0 });
    } catch {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, isPro: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(users);
    } catch {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req: AuthRequest, res: Response) => {
    try {
        const { role, isPro } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role, isPro }
        });
        res.json({ id: user.id, role: user.role, isPro: user.isPro });
    } catch {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// GET /api/admin/songs
router.get('/songs', async (req: AuthRequest, res: Response) => {
    try {
        const songs = await prisma.song.findMany({
            include: { artist: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(songs);
    } catch {
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

// PUT /api/admin/songs/:id/status
router.put('/songs/:id/status', async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const song = await prisma.song.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json({ id: song.id, status: song.status });
    } catch {
        res.status(500).json({ error: 'Failed to update song status' });
    }
});

export default router;
