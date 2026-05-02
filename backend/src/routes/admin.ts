import { Router, Response, Request } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import {
    buildPaymentSettingsResponse,
    encryptSecret,
    getOrCreatePayuSettings,
    getPayuConfigOrThrow,
    refundPayuPayment,
    verifyPayuPaymentStatus,
} from '../lib/payu';
import { getAdminReviewEmail, sendTransactionalEmail } from '../lib/mailer';
import { normalizeUserMedia } from '../utils/media';
import { sanitizeArtistTypes } from '../utils/profile';
import { notifyAdmins, notifyUserAndAdmins } from '../utils/notifications';

const router = Router();
router.use(authenticate, requireAdmin);

function normalizeString(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value === 'boolean') {
        return String(value);
    }

    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function normalizeOptionalString(value: unknown) {
    const normalized = normalizeString(value);
    return normalized || null;
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

function formatServiceSubmission(submission: any) {
    return {
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
    };
}

async function syncPayuSubmissionForAdminList(submission: any) {
    const payment = submission.payment;

    if (
        !payment ||
        payment.gateway !== 'payu' ||
        !payment.payuTxnId ||
        ['COMPLETED', 'FAILED', 'REFUNDED'].includes(payment.status)
    ) {
        return submission;
    }

    try {
        const { settings, salt1 } = await getPayuConfigOrThrow();
        const verifyResult = await verifyPayuPaymentStatus(
            settings.mode,
            settings.merchantKey || '',
            salt1,
            payment.payuTxnId,
        ).catch((error) => ({
            ok: false,
            raw: JSON.stringify({ error: error instanceof Error ? error.message : 'verify_failed' }),
            parsed: null as Record<string, unknown> | null,
        }));

        const rawTransaction =
            verifyResult.parsed &&
            typeof verifyResult.parsed === 'object' &&
            Array.isArray(verifyResult.parsed.result)
                ? verifyResult.parsed.result.find((item) =>
                    item &&
                    typeof item === 'object' &&
                    normalizeString((item as Record<string, unknown>).txnId || (item as Record<string, unknown>).txnid) === payment.payuTxnId,
                )
                : null;

        if (!rawTransaction || typeof rawTransaction !== 'object') {
            return {
                ...submission,
                payment: await prisma.payment.update({
                    where: { id: payment.id },
                    data: { payuVerifiedResponse: verifyResult.raw },
                }),
            };
        }

        const payuStatus = normalizeString((rawTransaction as Record<string, unknown>).status).toLowerCase();
        const nextPaymentStatus =
            payuStatus === 'success'
                ? 'COMPLETED'
                : payuStatus === 'failure' || payuStatus === 'failed'
                    ? 'FAILED'
                    : 'PENDING';
        const completedAt = nextPaymentStatus === 'COMPLETED'
            ? (payment.completedAt || new Date())
            : payment.completedAt;

        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: nextPaymentStatus,
                gatewayOrderId: payment.payuTxnId,
                gatewayPaymentId: normalizeOptionalString((rawTransaction as Record<string, unknown>).mihpayId || (rawTransaction as Record<string, unknown>).mihpayid),
                payuMihpayId: normalizeOptionalString((rawTransaction as Record<string, unknown>).mihpayId || (rawTransaction as Record<string, unknown>).mihpayid),
                payuBankRefNum: normalizeOptionalString((rawTransaction as Record<string, unknown>).bankReferenceNumber || (rawTransaction as Record<string, unknown>).bank_ref_num),
                payuPaymentMode: normalizeOptionalString((rawTransaction as Record<string, unknown>).mode),
                payuStatus: normalizeOptionalString((rawTransaction as Record<string, unknown>).status),
                payuUnmappedStatus: normalizeOptionalString((rawTransaction as Record<string, unknown>).unmappedStatus || (rawTransaction as Record<string, unknown>).unmappedstatus),
                payuVerifiedResponse: verifyResult.raw,
                failureMessage: nextPaymentStatus === 'FAILED'
                    ? normalizeOptionalString(
                        (rawTransaction as Record<string, unknown>).errorMessage ||
                        (rawTransaction as Record<string, unknown>).unmappedStatus ||
                        (rawTransaction as Record<string, unknown>).status,
                    )
                    : null,
                completedAt,
            },
        });

        if (nextPaymentStatus === 'COMPLETED' || nextPaymentStatus === 'FAILED') {
            const updatedSubmission = await prisma.submission.update({
                where: { id: submission.id },
                data: {
                    status: nextPaymentStatus === 'COMPLETED' ? 'PENDING' : 'PENDING_PAYMENT',
                    paymentStatus: nextPaymentStatus === 'COMPLETED' ? 'PAID' : 'FAILED',
                    paymentCompletedAt: nextPaymentStatus === 'COMPLETED'
                        ? (updatedPayment.completedAt || new Date())
                        : submission.paymentCompletedAt,
                },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    service: true,
                    payment: true,
                },
            });

            return updatedSubmission;
        }

        return {
            ...submission,
            payment: updatedPayment,
        };
    } catch (error) {
        console.error('Failed to auto-sync PayU submission:', error);
        return submission;
    }
}

function getParsedFormData(submission: { formData: string | null }) {
    const parsed = parseJsonValue(submission.formData);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
}

function getStringField(formData: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
        const value = formData[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return '';
}

function getSubmissionArtistName(submission: any) {
    const formData = getParsedFormData(submission);
    const combinedName = [
        getStringField(formData, ['artistFirstName', 'firstName']),
        getStringField(formData, ['artistLastName', 'lastName']),
    ].filter(Boolean).join(' ').trim();

    return (
        getStringField(formData, ['artistName', 'stageName', 'mainArtist', 'name']) ||
        combinedName ||
        submission.user?.name ||
        'Artist'
    );
}

function getSubmissionRecipientEmails(submission: any) {
    const formData = getParsedFormData(submission);
    return [...new Set([
        getStringField(formData, ['email', 'artistEmail', 'contactEmail']),
        submission.user?.email,
    ].filter(Boolean))];
}

function getPlanTitle(formData: Record<string, unknown>) {
    const plan = formData.plan;

    if (plan && typeof plan === 'object') {
        const title = (plan as Record<string, unknown>).title;
        if (typeof title === 'string' && title.trim()) {
            return title.trim();
        }
    }

    return getStringField(formData, ['planId', 'plan']);
}

function getSubmissionServiceLabel(submission: { service?: { name: string } | null; formData: string | null }) {
    const formData = getParsedFormData(submission);
    const planTitle = getPlanTitle(formData);
    return planTitle || submission.service?.name || 'Bouut Music service';
}

function getSubmissionKind(submission: { service?: { name: string } | null; formData: string | null }) {
    const formData = getParsedFormData(submission);
    const serviceType = getStringField(formData, ['serviceType']).toLowerCase();
    const serviceName = (submission.service?.name || '').toLowerCase();

    if (serviceName.includes('demo')) return 'demo';
    if (serviceName.includes('promote') || serviceType.includes('promote')) return 'promote';
    if (serviceName.includes('playlist')) return 'playlist';
    if (serviceName.includes('release') || serviceType.includes('release')) return 'release';
    if (serviceName.includes('growth') || serviceType.includes('growth')) return 'growth';
    return 'generic';
}

function buildReviewEmail(submission: any, status: 'APPROVED' | 'REJECTED') {
    const name = getSubmissionArtistName(submission);
    const serviceLabel = getSubmissionServiceLabel(submission);
    const kind = getSubmissionKind(submission);
    const isPaid = !!submission.paymentRequired;

    if (status === 'APPROVED' && kind === 'demo') {
        return {
            subject: 'Your Bouut Music demo submission has been approved',
            text: `Hi ${name}

We're delighted to see your creativity and the hard work you've put into this project. Your track is eligible for promotion or music distribution. Promote or distribute your music exclusively on @bouutmusic. We have simple, cheap & straightforward pricing. Starting from 49Rs. Choose a plan that's right for you - no matter where you are in your career.`,
        };
    }

    if (status === 'APPROVED') {
        return {
            subject: `Your Bouut Music ${serviceLabel} request has been approved`,
            text: `Hi ${name},

Your track has been approved. We're delighted to see your creativity and the hard work you've put into this project.

We're thrilled to announce that your track will be live on Bouut Music within 48 hours, so keep an eye out for it. Please let us know if you experience any issues or delay with the process.

Thanks for being a part of the Bouut Music community and we hope to see you around soon

Bouut music
connect@bouut.com`,
        };
    }

    if (kind === 'demo') {
        return {
            subject: 'Your Bouut Music demo submission was not approved',
            text: `Hi, ${name}

We regret to inform you that we have to decline your request for promotion request. We have reviewed your submission and unfortunately cannot approve it at the moment. We do appreciate your understanding and hope that you continue to use our services

Bouut music
connect@bouut.com`,
        };
    }

    return {
        subject: `Your Bouut Music ${serviceLabel} request was not approved`,
        text: `Hi, ${name}

We regret to inform you that we have to decline your request for promotion request. We have reviewed your submission and unfortunately cannot approve it at the moment. We do appreciate your understanding and hope that you continue to use our services

${isPaid ? `The refund has been initiated. You will be refunded the full amount. It may take 3-7 business days to show up in your account. Please contact us at connect@bouut.com if you experience any issues with the refund process.` : ''}

Bouut music
connect@bouut.com`,
};
}

async function sendReviewEmails(submission: any, status: 'APPROVED' | 'REJECTED') {
    const email = buildReviewEmail(submission, status);
    const artistRecipients = getSubmissionRecipientEmails(submission);
    const adminRecipient = getAdminReviewEmail();
    const deliveries = [];

    for (const recipient of artistRecipients) {
        const delivery = await sendTransactionalEmail({
            to: recipient,
            subject: email.subject,
            text: email.text,
        }).catch(error => {
            console.error('Failed to send review email to artist:', error);
            return { sent: false, skipped: false, reason: error instanceof Error ? error.message : 'send_failed' };
        });
        deliveries.push({ to: recipient, ...delivery });
    }

    if (adminRecipient) {
        const delivery = await sendTransactionalEmail({
            to: adminRecipient,
            subject: `[Admin copy] ${email.subject}`,
            text: email.text,
        }).catch(error => {
            console.error('Failed to send review email to admin:', error);
            return { sent: false, skipped: false, reason: error instanceof Error ? error.message : 'send_failed' };
        });
        deliveries.push({ to: adminRecipient, ...delivery });
    }

    return deliveries;
}

async function sendRefundStatusEmails(submission: any, result: { status: string; message: string }) {
    const name = getSubmissionArtistName(submission);
    const serviceLabel = getSubmissionServiceLabel(submission);
    const amount = submission.payment
        ? `${submission.payment.currency || 'INR'} ${roundCurrency(submission.payment.amount)}`
        : 'the paid amount';

    const email = {
        subject: `Refund update for ${serviceLabel}`,
        text: `Hi ${name},

Refund update for ${serviceLabel}: ${result.status}.

Amount: ${amount}
Message: ${result.message}

If the refund was initiated successfully, it may take 3-7 business days to show up in your account.

Bouut music
connect@bouut.com`,
    };

    const recipients = [...new Set([...getSubmissionRecipientEmails(submission), getAdminReviewEmail()].filter(Boolean))];

    for (const recipient of recipients) {
        await sendTransactionalEmail({
            to: recipient,
            subject: recipient === getAdminReviewEmail() ? `[Admin copy] ${email.subject}` : email.subject,
            text: email.text,
        }).catch(error => {
            console.error('Failed to send refund email:', error);
        });
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

const roasterArtistSelect = {
    id: true,
    slug: true,
    name: true,
    email: true,
    avatar: true,
    banner: true,
    genre: true,
    city: true,
    country: true,
    state: true,
    bio: true,
    artistTypes: true,
    isPro: true,
    roasterFeatured: true,
    roasterOrder: true,
    roasterFeaturedAt: true,
    createdAt: true,
} as const;

function formatRoasterArtist(artist: any) {
    return {
        ...normalizeUserMedia(artist),
        artistTypes: sanitizeArtistTypes(artist.artistTypes),
    };
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

// GET /api/admin/roaster
router.get('/roaster', async (_req: AuthRequest, res: Response) => {
    try {
        const artists = await prisma.user.findMany({
            where: {
                role: 'ARTIST',
                roasterFeatured: true,
            },
            select: roasterArtistSelect,
            orderBy: [
                { roasterOrder: 'asc' },
                { roasterFeaturedAt: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        res.json({ artists: artists.map(formatRoasterArtist) });
    } catch (error) {
        console.error('Failed to fetch roaster:', error);
        res.status(500).json({ error: 'Failed to fetch roaster' });
    }
});

// GET /api/admin/roaster/candidates?search=
router.get('/roaster/candidates', async (req: AuthRequest, res: Response) => {
    try {
        const search = normalizeString(req.query.search);

        const artists = await prisma.user.findMany({
            where: {
                role: 'ARTIST',
                roasterFeatured: false,
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search } },
                            { email: { contains: search } },
                            { genre: { contains: search } },
                            { city: { contains: search } },
                            { country: { contains: search } },
                        ],
                    }
                    : {}),
            },
            select: roasterArtistSelect,
            orderBy: { createdAt: 'desc' },
            take: 12,
        });

        res.json({ artists: artists.map(formatRoasterArtist) });
    } catch (error) {
        console.error('Failed to search roaster candidates:', error);
        res.status(500).json({ error: 'Failed to search artists' });
    }
});

// POST /api/admin/roaster
router.post('/roaster', async (req: AuthRequest, res: Response) => {
    try {
        const userId = normalizeString(req.body.userId);

        if (!userId) {
            return res.status(400).json({ error: 'Artist is required' });
        }

        const artist = await prisma.user.findFirst({
            where: {
                id: userId,
                role: 'ARTIST',
            },
            select: { id: true, roasterFeatured: true },
        });

        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        if (artist.roasterFeatured) {
            const featured = await prisma.user.findUnique({
                where: { id: userId },
                select: roasterArtistSelect,
            });
            return res.json(formatRoasterArtist(featured));
        }

        const maxOrder = await prisma.user.aggregate({
            where: { roasterFeatured: true },
            _max: { roasterOrder: true },
        });

        const featured = await prisma.user.update({
            where: { id: userId },
            data: {
                roasterFeatured: true,
                roasterFeaturedAt: new Date(),
                roasterOrder: (maxOrder._max.roasterOrder ?? 0) + 1,
            },
            select: roasterArtistSelect,
        });

        res.status(201).json(formatRoasterArtist(featured));
    } catch (error) {
        console.error('Failed to add roaster artist:', error);
        res.status(500).json({ error: 'Failed to add artist to roaster' });
    }
});

// PUT /api/admin/roaster/order
router.put('/roaster/order', async (req: AuthRequest, res: Response) => {
    try {
        const artistIds = Array.isArray(req.body.artistIds)
            ? req.body.artistIds.map((value: unknown) => normalizeString(value)).filter(Boolean)
            : [];

        if (artistIds.length === 0) {
            return res.status(400).json({ error: 'Artist order is required' });
        }

        await prisma.$transaction(
            artistIds.map((id: string, index: number) =>
                prisma.user.updateMany({
                    where: { id, roasterFeatured: true },
                    data: { roasterOrder: index + 1 },
                }),
            ),
        );

        const artists = await prisma.user.findMany({
            where: { role: 'ARTIST', roasterFeatured: true },
            select: roasterArtistSelect,
            orderBy: [
                { roasterOrder: 'asc' },
                { roasterFeaturedAt: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        res.json({ artists: artists.map(formatRoasterArtist) });
    } catch (error) {
        console.error('Failed to reorder roaster:', error);
        res.status(500).json({ error: 'Failed to reorder roaster' });
    }
});

// DELETE /api/admin/roaster/:id
router.delete('/roaster/:id', async (req: AuthRequest, res: Response) => {
    try {
        const artist = await prisma.user.findFirst({
            where: { id: req.params.id, role: 'ARTIST' },
            select: { id: true },
        });

        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        await prisma.user.update({
            where: { id: req.params.id },
            data: {
                roasterFeatured: false,
                roasterOrder: 0,
                roasterFeaturedAt: null,
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to remove roaster artist:', error);
        res.status(500).json({ error: 'Failed to remove artist from roaster' });
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
            data: { status },
            include: { artist: { select: { id: true, name: true, email: true } } },
        });
        await notifyUserAndAdmins(
            song.artistId,
            {
                type: status === 'APPROVED' ? 'song_approved' : status === 'REJECTED' ? 'song_rejected' : 'song_pending',
                title: `Song ${status.toLowerCase()}`,
                message: `"${song.title}" is now ${status.toLowerCase()}.`,
                link: '/dashboard/release/my-releases',
            },
            {
                type: 'admin_song_status',
                title: `Song ${status.toLowerCase()}`,
                message: `${song.artist?.name || 'An artist'}'s song "${song.title}" is now ${status.toLowerCase()}.`,
                link: '/admin/songs',
            },
        ).catch(error => console.error('Failed to create song status notifications:', error));
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
                ...(status
                    ? status === 'PENDING'
                        ? { status: { in: ['PENDING', 'PENDING_PAYMENT'] } }
                        : { status }
                    : {}),
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

        const syncedSubmissions = await Promise.all(
            submissions.map(submission => syncPayuSubmissionForAdminList(submission)),
        );

        const filtered = search
            ? syncedSubmissions.filter(submission => {
                const haystack = [
                    submission.id,
                    submission.user.name,
                    submission.user.email,
                    submission.service?.name || '',
                    submission.status,
                    submission.paymentStatus,
                    submission.formData || '',
                ].join(' ').toLowerCase();

                return haystack.includes(search);
            })
            : syncedSubmissions;

        res.json(filtered.map(formatServiceSubmission));
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

        const hasCompletedPayment = submission.payment?.status === 'COMPLETED';
        const canReviewPaidPendingPayment =
            submission.paymentRequired &&
            submission.status === 'PENDING_PAYMENT' &&
            hasCompletedPayment;

        if (submission.status !== 'PENDING' && !canReviewPaidPendingPayment) {
            return res.status(400).json({
                error: 'Only pending paid or free submissions can be reviewed.',
            });
        }

        if (submission.paymentRequired && !hasCompletedPayment) {
            return res.status(400).json({
                error: 'This form cannot be reviewed until PayU confirms the payment.',
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
                            ? (hasCompletedPayment ? 'PAID' : submission.paymentStatus)
                            : 'NOT_REQUIRED',
                        paymentCompletedAt: submission.paymentRequired && hasCompletedPayment
                            ? (submission.payment?.completedAt || submission.paymentCompletedAt || new Date())
                            : submission.paymentCompletedAt,
                    }
                    : {}),
                ...(nextStatus === 'REJECTED' && hasCompletedPayment
                    ? {
                        paymentStatus:
                            submission.payment.refundStatus === 'REFUNDED'
                                ? 'REFUNDED'
                                : 'REFUND_PENDING',
                        paymentCompletedAt: submission.payment?.completedAt || submission.paymentCompletedAt || new Date(),
                    }
                    : {}),
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                service: true,
                payment: true,
            },
        });

        const emailDelivery = await sendReviewEmails(updatedSubmission, nextStatus as 'APPROVED' | 'REJECTED');
        const serviceLabel = getSubmissionServiceLabel(updatedSubmission);

        await notifyUserAndAdmins(
            updatedSubmission.userId,
            {
                type: nextStatus === 'APPROVED' ? 'plan_approved' : 'plan_rejected',
                title: nextStatus === 'APPROVED' ? 'Plan approved' : 'Plan rejected',
                message: nextStatus === 'APPROVED'
                    ? `${serviceLabel} has been approved by admin.`
                    : `${serviceLabel} was rejected by admin.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
                link: '/dashboard/promo-tools',
            },
            {
                type: 'admin_plan_review',
                title: nextStatus === 'APPROVED' ? 'Plan approved' : 'Plan rejected',
                message: `${updatedSubmission.user?.name || 'A user'}'s ${serviceLabel} request was ${nextStatus.toLowerCase()}.`,
                link: '/admin/promo-submissions',
            },
        ).catch(error => console.error('Failed to create service review notifications:', error));

        res.json({
            ...formatServiceSubmission(updatedSubmission),
            emailDelivery,
        });
    } catch (error) {
        console.error('Failed to review service submission:', error);
        res.status(500).json({ error: 'Failed to review service submission' });
    }
});

// POST /api/admin/service-submissions/:id/sync-payment
router.post('/service-submissions/:id/sync-payment', async (req: AuthRequest, res: Response) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id: req.params.id },
            include: {
                payment: true,
                service: true,
                user: { select: { id: true, name: true, email: true } },
            },
        });

        if (!submission || submission.type !== 'service') {
            return res.status(404).json({ error: 'Service submission not found' });
        }

        if (!submission.payment) {
            return res.status(400).json({ error: 'No PayU payment record exists for this submission yet.' });
        }

        if (!submission.payment.payuTxnId) {
            return res.status(400).json({ error: 'This payment does not have a PayU transaction id yet.' });
        }

        if (submission.payment.status === 'COMPLETED') {
            const updatedSubmission = await prisma.submission.update({
                where: { id: submission.id },
                data: {
                    status: submission.status === 'PENDING_PAYMENT' ? 'PENDING' : submission.status,
                    paymentStatus: 'PAID',
                    paymentCompletedAt: submission.payment.completedAt || submission.paymentCompletedAt || new Date(),
                },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    service: true,
                    payment: true,
                },
            });

            return res.json(formatServiceSubmission(updatedSubmission));
        }

        const { settings, salt1 } = await getPayuConfigOrThrow();
        const verifyResult = await verifyPayuPaymentStatus(
            settings.mode,
            settings.merchantKey || '',
            salt1,
            submission.payment.payuTxnId,
        ).catch((error) => ({
            ok: false,
            raw: JSON.stringify({ error: error instanceof Error ? error.message : 'verify_failed' }),
            parsed: null as Record<string, unknown> | null,
        }));

        const rawTransaction =
            verifyResult.parsed &&
            typeof verifyResult.parsed === 'object' &&
            Array.isArray(verifyResult.parsed.result)
                ? verifyResult.parsed.result.find((item) =>
                    item &&
                    typeof item === 'object' &&
                    'txnId' in item &&
                    normalizeString((item as Record<string, unknown>).txnId) === submission.payment!.payuTxnId,
                )
                : null;

        if (!rawTransaction || typeof rawTransaction !== 'object') {
            await prisma.payment.update({
                where: { id: submission.payment.id },
                data: { payuVerifiedResponse: verifyResult.raw },
            });

            return res.status(400).json({
                error: 'PayU has not returned a completed transaction for this checkout yet.',
            });
        }

        const payuStatus = normalizeString((rawTransaction as Record<string, unknown>).status).toLowerCase();
        const nextPaymentStatus =
            payuStatus === 'success'
                ? 'COMPLETED'
                : payuStatus === 'failure' || payuStatus === 'failed'
                    ? 'FAILED'
                    : 'PENDING';
        const completedAt = nextPaymentStatus === 'COMPLETED'
            ? (submission.payment.completedAt || new Date())
            : submission.payment.completedAt;

        const updatedPayment = await prisma.payment.update({
            where: { id: submission.payment.id },
            data: {
                status: nextPaymentStatus,
                gatewayOrderId: submission.payment.payuTxnId,
                gatewayPaymentId: normalizeOptionalString((rawTransaction as Record<string, unknown>).mihpayId),
                payuMihpayId: normalizeOptionalString((rawTransaction as Record<string, unknown>).mihpayId),
                payuBankRefNum: normalizeOptionalString((rawTransaction as Record<string, unknown>).bankReferenceNumber),
                payuPaymentMode: normalizeOptionalString((rawTransaction as Record<string, unknown>).mode),
                payuStatus: normalizeOptionalString((rawTransaction as Record<string, unknown>).status),
                payuUnmappedStatus: normalizeOptionalString((rawTransaction as Record<string, unknown>).unmappedStatus),
                payuVerifiedResponse: verifyResult.raw,
                failureMessage: nextPaymentStatus === 'FAILED'
                    ? normalizeOptionalString(
                        (rawTransaction as Record<string, unknown>).errorMessage ||
                        (rawTransaction as Record<string, unknown>).unmappedStatus ||
                        (rawTransaction as Record<string, unknown>).status,
                    )
                    : null,
                completedAt,
            },
        });

        const updatedSubmission = await prisma.submission.update({
            where: { id: submission.id },
            data: {
                status: nextPaymentStatus === 'COMPLETED'
                    ? 'PENDING'
                    : submission.status,
                paymentStatus: nextPaymentStatus === 'COMPLETED'
                    ? 'PAID'
                    : nextPaymentStatus === 'FAILED'
                        ? 'FAILED'
                        : submission.paymentStatus,
                paymentCompletedAt: nextPaymentStatus === 'COMPLETED'
                    ? (updatedPayment.completedAt || new Date())
                    : submission.paymentCompletedAt,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                service: true,
                payment: true,
            },
        });

        res.json(formatServiceSubmission(updatedSubmission));
    } catch (error) {
        console.error('Failed to sync service payment:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to sync PayU payment' });
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
                const result = {
                    submissionId: submission.id,
                    paymentId: payment.id,
                    status: 'SKIPPED',
                    message: 'Only completed payments can be refunded.',
                };
                results.push(result);
                await sendRefundStatusEmails(submission, result);
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

                const result = {
                    submissionId: submission.id,
                    paymentId: payment.id,
                    status: 'FAILED',
                    message: 'Missing PayU transaction reference (mihpayid).',
                };
                results.push(result);
                await sendRefundStatusEmails(submission, result);
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

                const result = {
                    submissionId: submission.id,
                    paymentId: payment.id,
                    status: 'FAILED',
                    message: 'This is a simulated/demo PayU transaction ID. Only real PayU-paid transactions can be refunded.',
                };
                results.push(result);
                await sendRefundStatusEmails(submission, result);
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

            const result = {
                submissionId: submission.id,
                paymentId: updatedPayment.id,
                status: refundStatus,
                message: responseMessage,
                refundRequestId: updatedPayment.refundRequestId,
                refundTokenId: updatedPayment.refundTokenId,
            };
            results.push(result);
            await sendRefundStatusEmails(
                {
                    ...submission,
                    payment: updatedPayment,
                },
                result,
            );
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
