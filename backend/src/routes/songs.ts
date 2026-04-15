import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import fs from 'fs';
import {
    buildUploadUrl,
    getDefaultSongArtUrl,
    getUploadSubdir,
    normalizeSongMedia,
} from '../utils/media';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = getUploadSubdir('songs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
    },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

// GET /api/songs
router.get('/', async (req, res: Response) => {
    try {
        const { genre, language, sort = 'createdAt', tab = 'all', page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = { status: 'APPROVED', privacy: 'PUBLIC' };
        if (genre && genre !== 'All') where.genre = genre;
        if (language && language !== 'All') where.language = language;

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'popular' || tab === 'popular') orderBy = { plays: 'desc' };
        if (tab === 'latest') orderBy = { createdAt: 'desc' };

        const [songs, total] = await Promise.all([
            prisma.song.findMany({
                where,
                orderBy,
                skip,
                take: parseInt(limit as string),
                include: {
                    artist: { select: { id: true, name: true, avatar: true } },
                    album: { select: { id: true, title: true } },
                },
            }),
            prisma.song.count({ where }),
        ]);

        return res.json({
            songs: songs.map(normalizeSongMedia),
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string)),
        });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

// GET /api/songs/:id
router.get('/:id', async (req, res: Response) => {
    try {
        const song = await prisma.song.findUnique({
            where: { id: req.params.id },
            include: { artist: { select: { id: true, name: true, avatar: true, genre: true } }, album: true },
        });
        if (!song) return res.status(404).json({ error: 'Song not found' });

        // Increment play count
        await prisma.song.update({ where: { id: req.params.id }, data: { plays: { increment: 1 } } });

        return res.json(normalizeSongMedia(song));
    } catch {
        return res.status(500).json({ error: 'Failed to fetch song' });
    }
});

// POST /api/songs/upload (artist upload)
router.post('/upload', authenticate, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'artwork', maxCount: 1 }]), async (req: AuthRequest, res: Response) => {
    try {
        const { title, genre, language, year, description, privacy, featuredArtists } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files.audio?.[0]) return res.status(400).json({ error: 'Audio file required' });

        const audioUrl = buildUploadUrl('songs', files.audio[0].filename);
        const artUrl = files.artwork?.[0]
            ? buildUploadUrl('songs', files.artwork[0].filename)
            : getDefaultSongArtUrl();

        const song = await prisma.song.create({
            data: {
                title, genre, language, year: parseInt(year) || 2026, description, privacy: privacy || 'PUBLIC',
                audioUrl, artUrl, featuredArtists, artistId: req.user!.id, status: 'APPROVED',
            },
        });

        await prisma.notification.create({
            data: {
                userId: req.user!.id, type: 'upload_success',
                title: 'Song uploaded!', message: `"${title}" has been uploaded successfully.`,
            },
        });

        return res.status(201).json(normalizeSongMedia(song));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Upload failed' });
    }
});

// GET /api/songs/my/songs (my songs)
router.get('/my/songs', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const songs = await prisma.song.findMany({
            where: { artistId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            include: { album: { select: { title: true } } },
        });
        return res.json(songs.map(normalizeSongMedia));
    } catch {
        return res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

// PUT /api/songs/:id/like
router.put('/:id/like', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const existing = await prisma.like.findUnique({ where: { userId_songId: { userId: req.user!.id, songId: req.params.id } } });
        if (existing) {
            await prisma.like.delete({ where: { userId_songId: { userId: req.user!.id, songId: req.params.id } } });
            return res.json({ liked: false });
        } else {
            await prisma.like.create({ data: { userId: req.user!.id, songId: req.params.id } });
            return res.json({ liked: true });
        }
    } catch {
        return res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// DELETE /api/songs/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const song = await prisma.song.findUnique({ where: { id: req.params.id } });
        if (!song || (song.artistId !== req.user!.id && req.user!.role !== 'ADMIN')) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await prisma.song.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Song deleted' });
    } catch {
        return res.status(500).json({ error: 'Failed to delete song' });
    }
});

export default router;
