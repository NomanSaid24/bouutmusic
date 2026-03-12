import { Router, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/charts
router.get('/', async (req, res: Response) => {
    try {
        const { genre, language, limit = '50' } = req.query;
        const where: any = { status: 'APPROVED', privacy: 'PUBLIC' };
        if (genre && genre !== 'All') where.genre = genre;
        if (language && language !== 'All') where.language = language;

        const songs = await prisma.song.findMany({
            where,
            orderBy: { plays: 'desc' },
            take: parseInt(limit as string),
            include: { artist: { select: { id: true, name: true, avatar: true } } },
        });
        return res.json(songs);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch charts' });
    }
});

export default router;
