import { NextFunction, Router, Response } from 'express';
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
import { notifyAdmins } from '../utils/notifications';

const router = Router();
const RELEASE_MUSIC_SERVICE_ID = 'release-music-service';

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

function parseJsonRecord(value: string | null) {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(value) as Record<string, unknown>;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function getStringValue(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function getReleasePlanSummary(formData: Record<string, unknown> | null) {
    const plan = formData?.plan;

    if (plan && typeof plan === 'object') {
        const planRecord = plan as Record<string, unknown>;
        return {
            id: getStringValue(planRecord.id) || getStringValue(formData?.planId),
            title: getStringValue(planRecord.title) || 'Release Plan',
            price: typeof planRecord.price === 'number' ? planRecord.price : null,
            bestFor: getStringValue(planRecord.bestFor) || null,
        };
    }

    return {
        id: getStringValue(formData?.planId) || getStringValue(formData?.plan),
        title: getStringValue(formData?.plan) || 'Release Plan',
        price: null,
        bestFor: null,
    };
}

async function getPaidReleaseAccess(userId: string) {
    const submission = await prisma.submission.findFirst({
        where: {
            userId,
            type: 'service',
            OR: [
                { serviceId: RELEASE_MUSIC_SERVICE_ID },
                { service: { is: { name: { contains: 'Release' } } } },
            ],
        },
        orderBy: [
            { paymentCompletedAt: 'desc' },
            { createdAt: 'desc' },
        ],
        include: {
            service: true,
            payment: true,
        },
    });

    if (!submission) {
        return {
            hasAccess: false,
            state: 'NO_PLAN',
            submissionId: null,
            serviceName: null,
            plan: null,
            paymentCompletedAt: null,
        };
    }

    const formData = parseJsonRecord(submission.formData);
    const paymentCompleted = submission.paymentStatus === 'PAID' || submission.payment?.status === 'COMPLETED';
    const refundInProgress =
        ['REFUND_PENDING', 'REFUNDED'].includes(submission.paymentStatus) ||
        ['INITIATED', 'REFUNDED'].includes(submission.payment?.refundStatus || '');
    const hasAccess = paymentCompleted && submission.status !== 'REJECTED' && !refundInProgress;
    const state = hasAccess
        ? (submission.status === 'APPROVED' ? 'APPROVED' : 'PAID')
        : submission.status === 'REJECTED'
            ? 'REJECTED'
            : paymentCompleted
                ? 'PENDING_REVIEW'
                : 'PAYMENT_REQUIRED';

    return {
        hasAccess,
        state,
        submissionId: submission.id,
        serviceName: submission.service?.name || 'Release My Music',
        plan: getReleasePlanSummary(formData),
        paymentCompletedAt: submission.paymentCompletedAt || submission.payment?.completedAt || null,
    };
}

async function requireReleasePlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const access = await getPaidReleaseAccess(req.user!.id);

        if (!access.hasAccess) {
            return res.status(403).json({
                error: 'Please purchase a release plan before uploading music.',
                code: 'RELEASE_PLAN_REQUIRED',
            });
        }

        return next();
    } catch (error) {
        console.error('Release access check failed:', error);
        return res.status(500).json({ error: 'Unable to verify release plan access' });
    }
}

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

// GET /api/songs/release-access
router.get('/release-access', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const access = await getPaidReleaseAccess(req.user!.id);
        return res.json(access);
    } catch {
        return res.status(500).json({ error: 'Unable to verify release plan access' });
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
router.post('/upload', authenticate, requireReleasePlan, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'artwork', maxCount: 1 }]), async (req: AuthRequest, res: Response) => {
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
                link: '/dashboard/release/my-releases',
            },
        });
        await notifyAdmins({
            type: 'admin_song_submitted',
            title: 'Release song submitted',
            message: `"${title}" was uploaded for release/distribution review.`,
            link: '/admin/songs',
        }).catch(error => console.error('Failed to create admin song upload notification:', error));

        return res.status(201).json(normalizeSongMedia(song));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Upload failed' });
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
