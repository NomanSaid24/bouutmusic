import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const limit = Math.min(Math.max(parseInt(String(req.query.limit || '50'), 10) || 50, 1), 100);
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: req.user!.id,
                read: false,
            },
        });

        return res.json({ notifications, unreadCount });
    } catch {
        return res.status(500).json({ error: 'Failed' });
    }
});

router.put('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({ where: { userId: req.user!.id, read: false }, data: { read: true } });
        return res.json({ message: 'All marked read' });
    } catch {
        return res.status(500).json({ error: 'Failed' });
    }
});

router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: {
                id: req.params.id,
                userId: req.user!.id,
            },
            data: { read: true },
        });
        return res.json({ message: 'Marked read' });
    } catch {
        return res.status(500).json({ error: 'Failed' });
    }
});

export default router;
