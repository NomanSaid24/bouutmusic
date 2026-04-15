import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { normalizeAlbumMedia } from '../utils/media';

const router = Router();

// GET /api/albums
router.get('/', async (req, res: Response) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const [albums, total] = await Promise.all([
            prisma.album.findMany({
                skip, take: parseInt(limit as string),
                include: { artist: { select: { id: true, name: true, avatar: true } }, songs: { take: 1 } },
                orderBy: { releaseDate: 'desc' },
            }),
            prisma.album.count(),
        ]);
        return res.json({ albums: albums.map(normalizeAlbumMedia), total });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch albums' });
    }
});

// GET /api/albums/:id
router.get('/:id', async (req, res: Response) => {
    try {
        const album = await prisma.album.findUnique({
            where: { id: req.params.id },
            include: {
                artist: { select: { id: true, name: true, avatar: true } },
                songs: { include: { artist: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
            },
        });
        if (!album) return res.status(404).json({ error: 'Album not found' });
        return res.json(normalizeAlbumMedia(album));
    } catch {
        return res.status(500).json({ error: 'Failed to fetch album' });
    }
});

export default router;
