import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { notifyUserAndAdmins } from '../utils/notifications';

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
    // New Plans
    'starter-boost': { title: 'Starter Boost', price: 299 },
    'growth-push': { title: 'Growth Push', price: 899 },
    'viral-launch': { title: 'Viral Launch', price: 2499 },
    // New Add-ons
    'addon-extra-reel': { title: 'Extra reel', price: 300 },
    'addon-highlight-feature': { title: 'Highlight feature', price: 400 },
    'addon-artist-intro': { title: 'Artist introduction feature', price: 500 },
};

const GROWTH_ENGINE_SERVICE_ID = 'growth-engine-service';
const RELEASE_MUSIC_SERVICE_ID = 'release-music-service';

const GROWTH_ENGINE_PLANS: Record<string, { title: string; price: number; cadence: string; features: string[] }> = {
    basic: {
        title: 'Basic',
        price: 1499,
        cadence: 'month',
        features: [
            '1 Reel per week (4/month)',
            '1 Feed post per week',
            '3-5 Stories per week',
            'Friday Spotlight access',
        ],
    },
    pro: {
        title: 'Pro',
        price: 2999,
        cadence: 'month',
        features: [
            '2 Reels per week (8/month)',
            '2 Feed posts per week',
            'Daily Story promotion',
            'Priority posting',
            'Highlight feature included',
            'Pre-release hype included',
            'Dedicated attention',
            'Campaign planning',
            'Aggressive promotion',
            'Friday spotlight access',
            'Weekly top picks access',
        ],
    },
};

const RELEASE_MUSIC_PLANS: Record<string, { title: string; price: number; badge?: string; bestFor: string; features: string[] }> = {
    single: {
        title: 'Single Release',
        price: 499,
        bestFor: 'First-time releases',
        features: [
            'Get your music live worldwide',
            'Distribution to major platforms (Spotify, Apple Music, YouTube Music, etc.)',
            'Artist profile setup (if new)',
            'Basic metadata setup',
            'YouTube Content ID',
            'Lifetime royalty collection setup',
        ],
    },
    pro: {
        title: 'Pro Release',
        price: 999,
        badge: 'Most Popular',
        bestFor: 'Serious independent artists',
        features: [
            'Release + better reach + discovery',
            'Everything in Single, plus',
            'Worldwide + all major Indian platforms',
            'Faster delivery',
            'Unlimited tracks',
            'Metadata optimization (better discovery)',
            'Release date planning support',
            'Basic pre-release guidance',
            'Optional integration with Bouut Music promotion',
        ],
    },
    premium: {
        title: 'Premium Release',
        price: 1999,
        bestFor: 'Artists releasing professionally',
        features: [
            'Release + strategy + visibility support',
            'Everything in Pro, plus',
            'Pre-release strategy support',
            'Priority support & fast delivery',
            'Lyrics distribution',
            'Social media promotion assistance',
            'Caller tune distribution',
            'Publishing & copyright protection',
            'Priority placement for review/handling',
        ],
    },
};

const RELEASE_PLAN_PRICES: Record<string, number> = {
    single: 499,
    basic: 499,
    standard: 999,
    pro: 999,
    premium: 1999,
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

function derivePromoteMusicPricing(formData: Record<string, unknown>, fallbackServicePrice = 0) {
    const selectedPlanId = getStringValue(formData.plan);
    const selectedPlan = selectedPlanId && PROMOTION_SERVICE_PRICES[selectedPlanId] 
        ? { id: selectedPlanId, ...PROMOTION_SERVICE_PRICES[selectedPlanId] } 
        : null;

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

    const basePrice = selectedPlan ? selectedPlan.price : 0;
    const addonsPrice = pricedItems.reduce((sum, item) => sum + item.price, 0);
    const fallbackPrice = !selectedPlan && pricedItems.length === 0 ? roundCurrency(fallbackServicePrice) : 0;
    const subtotal = roundCurrency(basePrice + addonsPrice + fallbackPrice);

    const couponCode = getStringValue(formData.couponCode).toUpperCase();
    const discountAmount = couponCode === 'BOUUTMUSIC10'
        ? roundCurrency(subtotal * 0.10)
        : 0;
    const total = Math.max(0, roundCurrency(subtotal - discountAmount));

    return {
        amount: total,
        pricingMeta: {
            plan: selectedPlan,
            fallbackServicePrice: fallbackPrice,
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
    const rawPlan = getStringValue(formData.planId) || getStringValue(formData.plan);
    const normalizedPlan = normalizeName(rawPlan);
    const planKey = normalizedPlan === 'standard' ? 'pro' : normalizedPlan;
    const planPrice = RELEASE_PLAN_PRICES[planKey] ?? RELEASE_PLAN_PRICES.single;

    return {
        amount: planPrice,
        pricingMeta: {
            plan: planKey || 'single',
            total: planPrice,
        },
    };
}

function deriveServicePaymentAmount(service: { name: string; price: number }, formData: Record<string, unknown>) {
    const normalizedName = normalizeName(service.name);

    if (normalizedName.includes('promote my music') || normalizedName.includes('promote your music')) {
        return derivePromoteMusicPricing(formData, service.price);
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

async function notifyServiceSubmissionCreated(options: {
    userId: string;
    userEmail: string;
    type: string;
    serviceName: string;
    planName?: string;
    paymentRequired: boolean;
    status: string;
    userLink: string;
}) {
    const label = [options.serviceName, options.planName].filter(Boolean).join(' - ');
    const paymentCopy = options.paymentRequired
        ? 'Complete payment to send it for admin review.'
        : 'It has been sent for admin review.';

    await notifyUserAndAdmins(
        options.userId,
        {
            type: options.type,
            title: `${options.serviceName} request saved`,
            message: `Your ${label} request has been saved. ${paymentCopy}`,
            link: options.userLink,
        },
        {
            type: `admin_${options.type}`,
            title: `${options.serviceName} request received`,
            message: `${options.userEmail} submitted ${label}. Status: ${options.status}.`,
            link: '/admin/promo-submissions',
        },
    ).catch(error => console.error('Failed to create service submission notifications:', error));
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

// POST /api/services/growth-engine/submit
router.post('/growth-engine/submit', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const rawPlanId = getStringValue(
            req.body && typeof req.body === 'object' && 'planId' in req.body
                ? (req.body as Record<string, unknown>).planId
                : '',
        ).toLowerCase();
        const selectedPlan = GROWTH_ENGINE_PLANS[rawPlanId];

        if (!selectedPlan) {
            return res.status(400).json({ error: 'Please choose a valid Growth Engine plan.' });
        }

        const service = await prisma.service.upsert({
            where: { id: GROWTH_ENGINE_SERVICE_ID },
            update: {
                name: 'Growth Engine',
                description: 'Monthly artist growth program with campaign planning and promotional support.',
                price: selectedPlan.price,
                features: JSON.stringify(Object.values(GROWTH_ENGINE_PLANS).map(plan => ({
                    title: plan.title,
                    price: plan.price,
                    cadence: plan.cadence,
                    features: plan.features,
                }))),
                isActive: true,
            },
            create: {
                id: GROWTH_ENGINE_SERVICE_ID,
                name: 'Growth Engine',
                description: 'Monthly artist growth program with campaign planning and promotional support.',
                price: selectedPlan.price,
                features: JSON.stringify(Object.values(GROWTH_ENGINE_PLANS).map(plan => ({
                    title: plan.title,
                    price: plan.price,
                    cadence: plan.cadence,
                    features: plan.features,
                }))),
                isActive: true,
            },
        });

        const formData = {
            serviceType: 'growth-engine',
            planId: rawPlanId,
            plan: {
                id: rawPlanId,
                title: selectedPlan.title,
                price: selectedPlan.price,
                cadence: selectedPlan.cadence,
                features: selectedPlan.features,
            },
            pricingMeta: {
                plan: {
                    id: rawPlanId,
                    title: selectedPlan.title,
                    price: selectedPlan.price,
                    cadence: selectedPlan.cadence,
                },
                subtotal: selectedPlan.price,
                discountAmount: 0,
                total: selectedPlan.price,
            },
        };

        const submission = await prisma.submission.create({
            data: {
                userId: req.user!.id,
                serviceId: service.id,
                type: 'service',
                status: 'PENDING_PAYMENT',
                paymentStatus: 'UNPAID',
                paymentRequired: true,
                paymentAmount: selectedPlan.price,
                paymentCurrency: 'INR',
                formData: JSON.stringify(formData),
            },
        });

        await notifyServiceSubmissionCreated({
            userId: req.user!.id,
            userEmail: req.user!.email,
            type: 'growth_engine_submission_created',
            serviceName: service.name,
            planName: selectedPlan.title,
            paymentRequired: true,
            status: submission.status,
            userLink: `/dashboard/promo-tools/checkout?submissionId=${submission.id}`,
        });

        return res.status(201).json({
            submissionId: submission.id,
            status: submission.status,
            paymentStatus: submission.paymentStatus,
            paymentRequired: true,
            amount: selectedPlan.price,
            currency: 'INR',
            serviceName: service.name,
            plan: formData.plan,
            redirectUrl: `/dashboard/promo-tools/checkout?submissionId=${submission.id}`,
            message: 'Growth Engine plan selected. Complete payment to start onboarding.',
        });
    } catch (error) {
        console.error('Growth Engine submission failed:', error);
        return res.status(500).json({ error: 'Unable to start Growth Engine checkout' });
    }
});

// POST /api/services/release/submit
router.post('/release/submit', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const body = req.body && typeof req.body === 'object'
            ? req.body as Record<string, unknown>
            : {};
        const rawPlanId = getStringValue(body.planId || body.plan).toLowerCase();
        const selectedPlan = RELEASE_MUSIC_PLANS[rawPlanId];

        if (!selectedPlan) {
            return res.status(400).json({ error: 'Please choose a valid release plan.' });
        }

        const plansPayload = Object.values(RELEASE_MUSIC_PLANS).map(plan => ({
            title: plan.title,
            price: plan.price,
            badge: plan.badge || null,
            bestFor: plan.bestFor,
            features: plan.features,
        }));

        const service = await prisma.service.upsert({
            where: { id: RELEASE_MUSIC_SERVICE_ID },
            update: {
                name: 'Release My Music',
                description: 'Worldwide music distribution with metadata, Content ID, and release support.',
                price: selectedPlan.price,
                features: JSON.stringify(plansPayload),
                isActive: true,
            },
            create: {
                id: RELEASE_MUSIC_SERVICE_ID,
                name: 'Release My Music',
                description: 'Worldwide music distribution with metadata, Content ID, and release support.',
                price: selectedPlan.price,
                features: JSON.stringify(plansPayload),
                isActive: true,
            },
        });

        const formData = {
            serviceType: 'release-music',
            planId: rawPlanId,
            plan: {
                id: rawPlanId,
                title: selectedPlan.title,
                price: selectedPlan.price,
                bestFor: selectedPlan.bestFor,
                features: selectedPlan.features,
            },
            pricingMeta: {
                plan: {
                    id: rawPlanId,
                    title: selectedPlan.title,
                    price: selectedPlan.price,
                },
                subtotal: selectedPlan.price,
                discountAmount: 0,
                total: selectedPlan.price,
            },
        };

        const submission = await prisma.submission.create({
            data: {
                userId: req.user!.id,
                serviceId: service.id,
                type: 'service',
                status: 'PENDING_PAYMENT',
                paymentStatus: 'UNPAID',
                paymentRequired: true,
                paymentAmount: selectedPlan.price,
                paymentCurrency: 'INR',
                formData: JSON.stringify(formData),
            },
        });

        await notifyServiceSubmissionCreated({
            userId: req.user!.id,
            userEmail: req.user!.email,
            type: 'release_distribution_submission_created',
            serviceName: service.name,
            planName: selectedPlan.title,
            paymentRequired: true,
            status: submission.status,
            userLink: `/dashboard/promo-tools/checkout?submissionId=${submission.id}`,
        });

        return res.status(201).json({
            submissionId: submission.id,
            status: submission.status,
            paymentStatus: submission.paymentStatus,
            paymentRequired: true,
            amount: selectedPlan.price,
            currency: 'INR',
            serviceName: service.name,
            plan: formData.plan,
            redirectUrl: `/dashboard/promo-tools/checkout?submissionId=${submission.id}`,
            message: 'Release plan selected. Complete payment to unlock music submission.',
        });
    } catch (error) {
        console.error('Release Music submission failed:', error);
        return res.status(500).json({ error: 'Unable to start Release Music checkout' });
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

        await notifyServiceSubmissionCreated({
            userId: req.user!.id,
            userEmail: req.user!.email,
            type: paymentRequired ? 'service_submission_created' : 'service_submission_sent',
            serviceName: service.name,
            paymentRequired,
            status: submission.status,
            userLink: paymentRequired
                ? `/dashboard/promo-tools/checkout?submissionId=${submission.id}`
                : '/dashboard/promo-tools?submitted=1',
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
