import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/finance/reports
router.get('/reports', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId: req.user!.id, status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
        });
        const total = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        return res.json({ payments, total });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// GET /api/finance/royalties
router.get('/royalties', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        // Simulated royalty data per song
        const songs = await prisma.song.findMany({
            where: { artistId: req.user!.id },
            select: { id: true, title: true, plays: true },
        });
        const royalties = songs.map((s: any) => ({
            songId: s.id, title: s.title,
            streams: s.plays,
            royalty: parseFloat((s.plays * 0.003).toFixed(2)), // Rs. 0.003 per stream
        }));
        const total = royalties.reduce((sum: number, r: any) => sum + r.royalty, 0);
        return res.json({ royalties, totalRoyalty: parseFloat(total.toFixed(2)) });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch royalties' });
    }
});

export default router;
