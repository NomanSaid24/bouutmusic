import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { normalizeUserMedia } from '../utils/media';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const messages = await prisma.message.findMany({
            where: { OR: [{ senderId: req.user!.id }, { receiverId: req.user!.id }] },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                receiver: { select: { id: true, name: true, avatar: true } },
            },
        });
        return res.json(messages.map(message => ({
            ...message,
            sender: normalizeUserMedia(message.sender),
            receiver: normalizeUserMedia(message.receiver),
        })));
    } catch {
        return res.status(500).json({ error: 'Failed' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId, content } = req.body;
        const msg = await prisma.message.create({
            data: { senderId: req.user!.id, receiverId, content },
            include: { sender: { select: { id: true, name: true } } },
        });
        return res.status(201).json({
            ...msg,
            sender: normalizeUserMedia(msg.sender),
        });
    } catch {
        return res.status(500).json({ error: 'Failed' });
    }
});

export default router;
