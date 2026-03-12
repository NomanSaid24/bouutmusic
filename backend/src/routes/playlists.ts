import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/playlists
router.get('/', async (req, res: Response) => {
    try {
        const playlists = await prisma.playlist.findMany({
            where: { isPublic: true },
            include: { user: { select: { id: true, name: true } }, songs: { include: { song: true }, take: 4 } },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(playlists);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

// POST /api/playlists
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, isPublic } = req.body;
        const playlist = await prisma.playlist.create({
            data: { name, description, isPublic: isPublic !== false, userId: req.user!.id },
        });
        return res.status(201).json(playlist);
    } catch {
        return res.status(500).json({ error: 'Failed to create playlist' });
    }
});

// POST /api/playlists/:id/songs
router.post('/:id/songs', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { songId } = req.body;
        await prisma.playlistSong.upsert({
            where: { playlistId_songId: { playlistId: req.params.id, songId } },
            update: {},
            create: { playlistId: req.params.id, songId },
        });
        return res.json({ message: 'Song added to playlist' });
    } catch {
        return res.status(500).json({ error: 'Failed to add song' });
    }
});

export default router;
