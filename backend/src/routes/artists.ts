import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sanitizeArtistTypes } from '../utils/profile';
import { normalizeAlbumMedia, normalizeSongMedia, normalizeUserMedia } from '../utils/media';

const router = Router();

// GET /api/artists
router.get('/', async (req, res: Response) => {
    try {
        const { genre, page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const where: any = { role: { in: ['ARTIST', 'ADMIN'] } };
        if (genre && genre !== 'All') where.genre = genre;

        const [artists, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                select: { id: true, slug: true, name: true, avatar: true, genre: true, city: true, country: true, state: true, bio: true, artistTypes: true, isPro: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);
        return res.json({
            artists: artists.map(artist => ({
                ...normalizeUserMedia(artist),
                artistTypes: sanitizeArtistTypes(artist.artistTypes),
            })),
            total,
        });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch artists' });
    }
});

// GET /api/artists/:identifier
router.get('/:identifier', async (req, res: Response) => {
    try {
        const artist = await prisma.user.findFirst({
            where: {
                role: { in: ['ARTIST', 'ADMIN'] },
                OR: [
                    { id: req.params.identifier },
                    { slug: req.params.identifier },
                ],
            },
            select: {
                id: true, slug: true, name: true, avatar: true, banner: true, bio: true, artistTypes: true, genre: true, country: true, state: true, city: true, website: true,
                instagram: true, facebook: true, twitter: true, youtube: true, spotify: true, isPro: true,
                songs: {
                    where: { privacy: 'PUBLIC', status: 'APPROVED' },
                    orderBy: { plays: 'desc' },
                    take: 10,
                },
                albums: { orderBy: { releaseDate: 'desc' }, take: 6 },
                followers: true,
            },
        });
        if (!artist) return res.status(404).json({ error: 'Artist not found' });
        return res.json({
            ...normalizeUserMedia(artist),
            songs: artist.songs.map(normalizeSongMedia),
            albums: artist.albums.map(normalizeAlbumMedia),
            artistTypes: sanitizeArtistTypes(artist.artistTypes),
            followerCount: artist.followers.length,
        });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch artist' });
    }
});

// POST /api/artists/:id/follow
router.post('/:id/follow', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: req.user!.id, followingId: req.params.id } } });
        if (existing) {
            await prisma.follow.delete({ where: { followerId_followingId: { followerId: req.user!.id, followingId: req.params.id } } });
            return res.json({ following: false });
        } else {
            await prisma.follow.create({ data: { followerId: req.user!.id, followingId: req.params.id } });
            return res.json({ following: true });
        }
    } catch {
        return res.status(500).json({ error: 'Failed to toggle follow' });
    }
});

export default router;
