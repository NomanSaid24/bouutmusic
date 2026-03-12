import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/opportunities
router.get('/', async (req, res: Response) => {
    try {
        const { status = 'active' } = req.query;
        const opportunities = await prisma.opportunity.findMany({
            where: { isActive: status === 'active' },
            orderBy: { deadline: 'asc' },
        });
        return res.json(opportunities);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
});

// POST /api/opportunities/:id/apply
router.post('/:id/apply', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const submission = await prisma.submission.create({
            data: { userId: req.user!.id, opportunityId: req.params.id, type: 'opportunity' },
        });
        return res.status(201).json(submission);
    } catch {
        return res.status(500).json({ error: 'Application failed' });
    }
});

export default router;
