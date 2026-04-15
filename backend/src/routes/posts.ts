import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { normalizeUserMedia } from '../utils/media';

const router = Router();

// GET /api/posts
router.get('/', async (req, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            where: { published: true },
            orderBy: { publishedAt: 'desc' },
            include: { author: { select: { name: true, avatar: true } } },
        });
        return res.json(posts.map(post => ({
            ...post,
            author: normalizeUserMedia(post.author),
        })));
    } catch {
        return res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/posts/:slug
router.get('/:slug', async (req, res: Response) => {
    try {
        const post = await prisma.post.findUnique({
            where: { slug: req.params.slug },
            include: { author: { select: { name: true, avatar: true } } },
        });
        if (!post) return res.status(404).json({ error: 'Post not found' });
        return res.json({
            ...post,
            author: normalizeUserMedia(post.author),
        });
    } catch {
        return res.status(500).json({ error: 'Failed' });
    }
});

export default router;
