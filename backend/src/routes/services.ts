import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const PROMOTION_SERVICE_PRICES: Record<string, { title: string; price: number }> = {
    'instagram-story': { title: 'Instagram Story', price: 49 },
    'instagram-post': { title: 'Instagram Post', price: 99 },
    'bundle-pack': { title: 'Bundle Pack Includes (Story, Post, Reel)', price: 298 },
    'instagram-reel': { title: 'Instagram Reel', price: 150 },
    'upcoming-release-buzz': { title: 'Create buzz for my upcoming release', price: 499 },
    'new-friday-music': { title: 'Get my music listed to "New Friday Music"', price: 399 },
    highlights: { title: 'Reserve my spot in highlights', price: 199 },
    'get-to-know-me': { title: 'Get me listed to "Get To Know Me"', price: 199 },
    'infinite-promotion': { title: 'Infinite Promotion', price: 999 },
};

const RELEASE_PLAN_PRICES: Record<string, number> = {
    basic: 299,
    standard: 499,
    premium: 999,
};

function roundCurrency(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseJsonRecord(value: unknown) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    try {
        const parsed = JSON.parse(value) as Record<string, unknown>;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function normalizeName(name: string) {
    return name.trim().toLowerCase();
}

function getStringValue(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function derivePromoteMusicPricing(formData: Record<string, unknown>) {
    const selectedServices = Array.isArray(formData.selectedServices) ? formData.selectedServices : [];
    const selectedIds = selectedServices
        .map(item => {
            if (typeof item === 'string') {
                return item;
            }

            if (item && typeof item === 'object' && 'id' in item && typeof item.id === 'string') {
                return item.id;
            }

            return '';
        })
        .filter(Boolean);

    const uniqueIds = [...new Set(selectedIds)];
    const pricedItems = uniqueIds
        .map(id => ({ id, ...PROMOTION_SERVICE_PRICES[id] }))
        .filter(item => !!item.title);

    const subtotal = pricedItems.reduce((sum, item) => sum + item.price, 0);
    const couponCode = getStringValue(formData.couponCode).toUpperCase();
    const discountAmount = couponCode === 'BOUUTMUSIC10' && uniqueIds.includes('bundle-pack')
        ? roundCurrency(PROMOTION_SERVICE_PRICES['bundle-pack'].price * 0.10)
        : 0;
    const total = Math.max(0, roundCurrency(subtotal - discountAmount));

    return {
        amount: total,
        pricingMeta: {
            selectedServiceIds: uniqueIds,
            selectedServices: pricedItems,
            subtotal,
            discountAmount,
            total,
            couponCode,
        },
    };
}

function deriveReleasePricing(formData: Record<string, unknown>) {
    const normalizedPlan = normalizeName(getStringValue(formData.plan));
    const planPrice = RELEASE_PLAN_PRICES[normalizedPlan] ?? RELEASE_PLAN_PRICES.basic;

    return {
        amount: planPrice,
        pricingMeta: {
            plan: normalizedPlan || 'basic',
            total: planPrice,
        },
    };
}

function deriveServicePaymentAmount(service: { name: string; price: number }, formData: Record<string, unknown>) {
    const normalizedName = normalizeName(service.name);

    if (normalizedName.includes('promote my music')) {
        return derivePromoteMusicPricing(formData);
    }

    if (normalizedName.includes('release')) {
        return deriveReleasePricing(formData);
    }

    return {
        amount: roundCurrency(service.price),
        pricingMeta: {
            total: roundCurrency(service.price),
        },
    };
}

// GET /api/services
router.get('/', async (_req, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
        });
        return res.json(services);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET /api/services/submissions/:id
router.get('/submissions/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const submission = await prisma.submission.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id,
                type: 'service',
            },
            include: {
                service: true,
                payment: true,
            },
        });

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        return res.json({
            id: submission.id,
            type: submission.type,
            status: submission.status,
            paymentStatus: submission.paymentStatus,
            paymentRequired: submission.paymentRequired,
            paymentAmount: submission.paymentAmount,
            paymentCurrency: submission.paymentCurrency,
            paymentCompletedAt: submission.paymentCompletedAt,
            createdAt: submission.createdAt,
            service: submission.service,
            formData: parseJsonRecord(submission.formData),
            payment: submission.payment,
        });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch submission details' });
    }
});

// POST /api/services/:id/submit
router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const rawFormData =
            req.body && typeof req.body.formData === 'object' && req.body.formData
                ? (req.body.formData as Record<string, unknown>)
                : {};

        const service = await prisma.service.findFirst({
            where: {
                id: req.params.id,
                isActive: true,
            },
        });

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const pricing = deriveServicePaymentAmount(service, rawFormData);
        const paymentRequired = pricing.amount > 0;
        const enrichedFormData = {
            ...rawFormData,
            pricingMeta: pricing.pricingMeta,
        };

        const submission = await prisma.submission.create({
            data: {
                userId: req.user!.id,
                serviceId: service.id,
                type: 'service',
                status: paymentRequired ? 'PENDING_PAYMENT' : 'PENDING',
                paymentStatus: paymentRequired ? 'UNPAID' : 'NOT_REQUIRED',
                paymentRequired,
                paymentAmount: paymentRequired ? pricing.amount : null,
                paymentCurrency: paymentRequired ? 'INR' : null,
                formData: JSON.stringify(enrichedFormData),
            },
        });

        return res.status(201).json({
            submissionId: submission.id,
            status: submission.status,
            paymentStatus: submission.paymentStatus,
            paymentRequired,
            amount: paymentRequired ? pricing.amount : 0,
            currency: paymentRequired ? 'INR' : null,
            serviceName: service.name,
            redirectUrl: paymentRequired
                ? `/dashboard/promo-tools/checkout?submissionId=${submission.id}`
                : '/dashboard/promo-tools?submitted=1',
            message: paymentRequired
                ? 'Submission saved. Complete payment to send it for review.'
                : 'Submission saved successfully and sent for review.',
        });
    } catch (error) {
        console.error('Service submission failed:', error);
        return res.status(500).json({ error: 'Submission failed' });
    }
});

export default router;
