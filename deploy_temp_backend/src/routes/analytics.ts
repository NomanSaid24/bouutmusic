import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requirePro } from '../middleware/auth';

const router = Router();

// GET /api/analytics/streams (Pro only)
router.get('/streams', authenticate, requirePro, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        // Get total plays across all songs by this artist
        const songs = await prisma.song.findMany({
            where: { artistId: userId },
            select: { id: true, title: true, plays: true, downloads: true }
        });

        const totalPlays = songs.reduce((acc, song) => acc + song.plays, 0);
        const totalDownloads = songs.reduce((acc, song) => acc + song.downloads, 0);

        // Dummy weekly trend data for charts
        const weeklyTrends = Array.from({ length: 7 }, (_, i) => ({
            day: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
            plays: Math.floor(Math.random() * 5000),
        }));

        res.json({
            overview: {
                totalPlays,
                totalDownloads,
                songsUploaded: songs.length,
                profileViews: Math.floor(totalPlays * 0.15), // fake metric for demo
            },
            topSongs: songs.sort((a, b) => b.plays - a.plays).slice(0, 5),
            trends: weeklyTrends
        });
    } catch {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
