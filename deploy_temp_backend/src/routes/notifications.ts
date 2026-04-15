import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return res.json(notifications);
    } catch {
        return res.status(500).json({ error: 'Failed' });
    }
});

router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
        return res.json({ message: 'Marked read' });
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

export default router;
