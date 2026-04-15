import { Router, Response, Request } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import {
    buildPaymentSettingsResponse,
    encryptSecret,
    getOrCreatePayuSettings,
    getPayuConfigOrThrow,
    refundPayuPayment,
} from '../lib/payu';

const router = Router();
router.use(authenticate, requireAdmin);

function normalizeString(value: unknown) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function roundCurrency(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseJsonValue(value: string | null) {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function isSimulatedPayuId(value: string | null) {
    const normalized = normalizeString(value).toLowerCase();

    if (!normalized) {
        return false;
    }

    return (
        normalized.startsWith('test_') ||
        normalized.startsWith('payu_test_') ||
        normalized.includes('demo')
    );
}

// GET /api/admin/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const userCount = await prisma.user.count();
        const songCount = await prisma.song.count();
        const pendingSongs = await prisma.song.count({ where: { status: 'PENDING' } });
        const revenue = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' }});
        
        res.json({ users: userCount, songs: songCount, pendingSongs, revenue: revenue._sum.amount || 0 });
    } catch {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, isPro: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(users);
    } catch {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req: AuthRequest, res: Response) => {
    try {
        const { role, isPro } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role, isPro }
        });
        res.json({ id: user.id, role: user.role, isPro: user.isPro });
    } catch {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// GET /api/admin/songs
router.get('/songs', async (req: AuthRequest, res: Response) => {
    try {
        const songs = await prisma.song.findMany({
            include: { artist: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(songs);
    } catch {
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

// PUT /api/admin/songs/:id/status
router.put('/songs/:id/status', async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const song = await prisma.song.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json({ id: song.id, status: song.status });
    } catch {
        res.status(500).json({ error: 'Failed to update song status' });
    }
});

// GET /api/admin/payments
router.get('/payments', async (_req: AuthRequest, res: Response) => {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        res.json(payments);
    } catch {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// GET /api/admin/services
router.get('/services', async (_req: AuthRequest, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { createdAt: 'asc' },
        });

        res.json(services);
    } catch {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// PUT /api/admin/services/:id
router.put('/services/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, price, features, isActive } = req.body;

        const updated = await prisma.service.update({
            where: { id: req.params.id },
            data: {
                ...(typeof name === 'string' ? { name: name.trim() } : {}),
                ...(typeof description === 'string' ? { description: description.trim() } : {}),
                ...(typeof price === 'number' && Number.isFinite(price) ? { price: roundCurrency(price) } : {}),
                ...(typeof features === 'string' ? { features } : {}),
                ...(typeof isActive === 'boolean' ? { isActive } : {}),
            },
        });

        res.json(updated);
    } catch (error) {
        console.error('Failed to update service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// GET /api/admin/service-submissions
router.get('/service-submissions', async (req: AuthRequest, res: Response) => {
    try {
        const status = normalizeString(req.query.status);
        const search = normalizeString(req.query.search).toLowerCase();
        const refundQueue = normalizeString(req.query.refundQueue) === '1';

        const submissions = await prisma.submission.findMany({
            where: {
                type: 'service',
                ...(status ? { status } : {}),
                ...(refundQueue
                    ? {
                        status: 'REJECTED',
                        paymentRequired: true,
                        payment: {
                            is: {
                                status: 'COMPLETED',
                                refundStatus: { in: ['NONE', 'FAILED'] },
                            },
                        },
                    }
                    : {}),
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                service: true,
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const filtered = search
            ? submissions.filter(submission => {
                const haystack = [
                    submission.id,
                    submission.user.name,
                    submission.user.email,
                    submission.service?.name || '',
                    submission.status,
                    submission.paymentStatus,
                ].join(' ').toLowerCase();

                return haystack.includes(search);
            })
            : submissions;

        res.json(
            filtered.map(submission => ({
                ...submission,
                formData: parseJsonValue(submission.formData),
                payment: submission.payment
                    ? {
                        ...submission.payment,
                        payuRequestPayload: parseJsonValue(submission.payment.payuRequestPayload),
                        payuResponse: parseJsonValue(submission.payment.payuResponse),
                        payuVerifiedResponse: parseJsonValue(submission.payment.payuVerifiedResponse),
                        refundResponse: parseJsonValue(submission.payment.refundResponse),
                    }
                    : null,
            })),
        );
    } catch (error) {
        console.error('Failed to fetch service submissions:', error);
        res.status(500).json({ error: 'Failed to fetch service submissions' });
    }
});

// PUT /api/admin/service-submissions/:id/review
router.put('/service-submissions/:id/review', async (req: AuthRequest, res: Response) => {
    try {
        const nextStatus = normalizeString(req.body.status).toUpperCase();
        const rejectionReason = normalizeString(req.body.rejectionReason) || null;
        const adminNotes = normalizeString(req.body.adminNotes) || null;

        if (!['APPROVED', 'REJECTED'].includes(nextStatus)) {
            return res.status(400).json({ error: 'Invalid review status' });
        }

        const submission = await prisma.submission.findUnique({
            where: { id: req.params.id },
            include: { payment: true, service: true, user: { select: { id: true, name: true, email: true } } },
        });

        if (!submission || submission.type !== 'service') {
            return res.status(404).json({ error: 'Service submission not found' });
        }

        if (submission.status !== 'PENDING') {
            return res.status(400).json({
                error: 'Only pending promo submissions can be reviewed.',
            });
        }

        if (submission.paymentRequired && submission.payment?.status !== 'COMPLETED') {
            return res.status(400).json({
                error: 'This promo form cannot be reviewed until its payment is completed.',
            });
        }

        const updatedSubmission = await prisma.submission.update({
            where: { id: submission.id },
            data: {
                status: nextStatus,
                reviewedAt: new Date(),
                reviewedById: req.user!.id,
                rejectionReason: nextStatus === 'REJECTED' ? rejectionReason : null,
                adminNotes,
                ...(nextStatus === 'APPROVED'
                    ? {
                        paymentStatus: submission.paymentRequired
                            ? (submission.payment?.status === 'COMPLETED' ? 'PAID' : submission.paymentStatus)
                            : 'NOT_REQUIRED',
                    }
                    : {}),
                ...(nextStatus === 'REJECTED' && submission.payment?.status === 'COMPLETED'
                    ? {
                        paymentStatus:
                            submission.payment.refundStatus === 'REFUNDED'
                                ? 'REFUNDED'
                                : 'REFUND_PENDING',
                    }
                    : {}),
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                service: true,
                payment: true,
            },
        });

        res.json({
            ...updatedSubmission,
            formData: parseJsonValue(updatedSubmission.formData),
            payment: updatedSubmission.payment
                ? {
                    ...updatedSubmission.payment,
                    payuRequestPayload: parseJsonValue(updatedSubmission.payment.payuRequestPayload),
                    payuResponse: parseJsonValue(updatedSubmission.payment.payuResponse),
                    payuVerifiedResponse: parseJsonValue(updatedSubmission.payment.payuVerifiedResponse),
                    refundResponse: parseJsonValue(updatedSubmission.payment.refundResponse),
                }
                : null,
        });
    } catch (error) {
        console.error('Failed to review service submission:', error);
        res.status(500).json({ error: 'Failed to review service submission' });
    }
});

// POST /api/admin/service-submissions/refunds
router.post('/service-submissions/refunds', async (req: AuthRequest, res: Response) => {
    try {
        const ids = Array.isArray(req.body.ids)
            ? req.body.ids.map((value: unknown) => normalizeString(value)).filter(Boolean)
            : [];
        const reason = normalizeString(req.body.reason) || 'Refund requested by admin after rejection';

        if (!ids.length) {
            return res.status(400).json({ error: 'No submissions selected for refund.' });
        }

        const submissions = await prisma.submission.findMany({
            where: {
                id: { in: ids },
                type: 'service',
                status: 'REJECTED',
            },
            include: {
                payment: true,
                service: true,
                user: { select: { id: true, name: true, email: true } },
            },
        });

        const { settings, salt1 } = await getPayuConfigOrThrow();
        const results: Array<Record<string, unknown>> = [];

        for (const submission of submissions) {
            const payment = submission.payment;

            if (!payment) {
                results.push({
                    submissionId: submission.id,
                    status: 'SKIPPED',
                    message: 'No payment record found for this submission.',
                });
                continue;
            }

            if (payment.status !== 'COMPLETED') {
                results.push({
                    submissionId: submission.id,
                    paymentId: payment.id,
                    status: 'SKIPPED',
                    message: 'Only completed payments can be refunded.',
                });
                continue;
            }

            if (!payment.payuMihpayId) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        refundStatus: 'FAILED',
                        refundReason: reason,
                        refundRequestedAt: new Date(),
                        refundResponse: JSON.stringify({
                            error: 'missing_mihpayid',
                            message: 'Missing PayU transaction reference (mihpayid).',
                        }),
                    },
                });

                await prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        paymentStatus: 'REFUND_FAILED',
                        refundRequestedAt: new Date(),
                    },
                });

                results.push({
                    submissionId: submission.id,
                    paymentId: payment.id,
                    status: 'FAILED',
                    message: 'Missing PayU transaction reference (mihpayid).',
                });
                continue;
            }

            if (isSimulatedPayuId(payment.payuMihpayId)) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        refundStatus: 'FAILED',
                        refundReason: reason,
                        refundRequestedAt: new Date(),
                        refundResponse: JSON.stringify({
                            error: 'simulated_mihpayid',
                            message: 'This is a simulated/demo PayU transaction ID. Only real PayU-paid transactions can be refunded.',
                        }),
                    },
                });

                await prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        paymentStatus: 'REFUND_FAILED',
                        refundRequestedAt: new Date(),
                    },
                });

                results.push({
                    submissionId: submission.id,
                    paymentId: payment.id,
                    status: 'FAILED',
                    message: 'This is a simulated/demo PayU transaction ID. Only real PayU-paid transactions can be refunded.',
                });
                continue;
            }

            const refundTokenId = payment.refundTokenId || `RFND${payment.id.replace(/[^a-zA-Z0-9]/g, '').slice(-10)}${Date.now().toString().slice(-6)}`;
            const refundAmount = roundCurrency(payment.amount).toFixed(2);
            const refundResult = await refundPayuPayment(
                settings.mode,
                settings.merchantKey || '',
                salt1,
                payment.payuMihpayId,
                refundTokenId,
                refundAmount,
            ).catch((error) => ({
                ok: false,
                raw: JSON.stringify({ error: error instanceof Error ? error.message : 'refund_failed' }),
                parsed: null as Record<string, unknown> | null,
            }));

            const parsed = refundResult.parsed || {};
            const requestId = normalizeString((parsed.request_id as string) || (parsed.requestId as string));
            let responseMessage =
                normalizeString((parsed.msg as string) || (parsed.message as string) || (parsed.status as string)) ||
                (refundResult.ok ? 'Refund request submitted to PayU.' : 'PayU refund request failed.');

            if (!refundResult.ok && refundResult.raw.includes('403 Forbidden')) {
                responseMessage = 'PayU rejected the refund request (403). Make sure Refund Wallet is activated/funded in PayU and use a real PayU transaction ID.';
            }

            const refundStatus = refundResult.ok ? 'INITIATED' : 'FAILED';

            const updatedPayment = await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    refundStatus,
                    refundAmount: payment.amount,
                    refundRequestId: requestId || payment.refundRequestId,
                    refundTokenId,
                    refundReason: reason,
                    refundResponse: refundResult.raw,
                    refundRequestedAt: new Date(),
                },
            });

            await prisma.submission.update({
                where: { id: submission.id },
                data: {
                    paymentStatus: refundStatus === 'FAILED' ? 'REFUND_FAILED' : 'REFUND_PENDING',
                    refundRequestedAt: new Date(),
                },
            });

            results.push({
                submissionId: submission.id,
                paymentId: updatedPayment.id,
                status: refundStatus,
                message: responseMessage,
                refundRequestId: updatedPayment.refundRequestId,
                refundTokenId: updatedPayment.refundTokenId,
            });
        }

        res.json({
            count: results.length,
            results,
        });
    } catch (error) {
        console.error('Failed to process service refunds:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process refunds' });
    }
});

// GET /api/admin/payment-settings
router.get('/payment-settings', async (_req: AuthRequest, res: Response) => {
    try {
        const settings = await getOrCreatePayuSettings();
        res.json(buildPaymentSettingsResponse(settings));
    } catch (error) {
        console.error('Failed to fetch payment settings:', error);
        res.status(500).json({ error: 'Failed to fetch payment settings' });
    }
});

// PUT /api/admin/payment-settings
router.put('/payment-settings', async (req: AuthRequest, res: Response) => {
    try {
        const currentSettings = await getOrCreatePayuSettings();
        const {
            mode,
            isEnabled,
            merchantId,
            merchantKey,
            salt1,
            salt2,
            clearSalt1,
            clearSalt2,
            currency,
            productName,
            originalAmount,
            discountedAmount,
            taxPercent,
            proDurationDays,
        } = req.body;

        const updatedSettings = await prisma.payuSettings.update({
            where: { id: currentSettings.id },
            data: {
                mode: typeof mode === 'string' && mode.trim() ? mode.trim() : currentSettings.mode,
                isEnabled: typeof isEnabled === 'boolean' ? isEnabled : currentSettings.isEnabled,
                merchantId: typeof merchantId === 'string' ? merchantId.trim() : currentSettings.merchantId,
                merchantKey: typeof merchantKey === 'string' ? merchantKey.trim() : currentSettings.merchantKey,
                salt1Encrypted: clearSalt1
                    ? null
                    : (typeof salt1 === 'string' && salt1.trim()
                        ? encryptSecret(salt1.trim())
                        : currentSettings.salt1Encrypted),
                salt2Encrypted: clearSalt2
                    ? null
                    : (typeof salt2 === 'string' && salt2.trim()
                        ? encryptSecret(salt2.trim())
                        : currentSettings.salt2Encrypted),
                currency: typeof currency === 'string' && currency.trim()
                    ? currency.trim().toUpperCase()
                    : currentSettings.currency,
                productName: typeof productName === 'string' && productName.trim()
                    ? productName.trim()
                    : currentSettings.productName,
                originalAmount: typeof originalAmount === 'number' && originalAmount > 0
                    ? originalAmount
                    : currentSettings.originalAmount,
                discountedAmount: typeof discountedAmount === 'number' && discountedAmount > 0
                    ? discountedAmount
                    : currentSettings.discountedAmount,
                taxPercent: typeof taxPercent === 'number' && taxPercent >= 0
                    ? taxPercent
                    : currentSettings.taxPercent,
                proDurationDays: typeof proDurationDays === 'number' && proDurationDays > 0
                    ? Math.round(proDurationDays)
                    : currentSettings.proDurationDays,
            },
        });

        res.json(buildPaymentSettingsResponse(updatedSettings));
    } catch (error) {
        console.error('Failed to save payment settings:', error);
        res.status(500).json({ error: 'Failed to save payment settings' });
    }
});

export default router;
