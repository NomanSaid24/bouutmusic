import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/services
router.get('/', async (req, res: Response) => {
    try {
        const services = await prisma.service.findMany({ where: { isActive: true } });
        return res.json(services);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// POST /api/services/:id/submit
router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { formData } = req.body;
        const submission = await prisma.submission.create({
            data: { 
                userId: req.user!.id, 
                serviceId: req.params.id, 
                type: 'service',
                formData: formData ? JSON.stringify(formData) : null
            },
        });
        return res.status(201).json(submission);
    } catch {
        return res.status(500).json({ error: 'Submission failed' });
    }
});

export default router;
