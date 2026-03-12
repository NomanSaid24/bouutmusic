import { Router, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/search?q=
router.get('/', async (req, res: Response) => {
    try {
        const { q = '', limit = '10' } = req.query;
        const take = parseInt(limit as string);
        const search = q as string;

        const [songs, artists, albums] = await Promise.all([
            prisma.song.findMany({
                where: { OR: [{ title: { contains: search } }, { genre: { contains: search } }], status: 'APPROVED', privacy: 'PUBLIC' },
                take,
                include: { artist: { select: { id: true, name: true, avatar: true } } },
            }),
            prisma.user.findMany({
                where: { name: { contains: search }, role: { in: ['ARTIST', 'ADMIN'] } },
                take,
                select: { id: true, name: true, avatar: true, genre: true },
            }),
            prisma.album.findMany({
                where: { title: { contains: search } },
                take,
                include: { artist: { select: { id: true, name: true } } },
            }),
        ]);

        return res.json({ songs, artists, albums, query: search });
    } catch {
        return res.status(500).json({ error: 'Search failed' });
    }
});

export default router;
