import prisma from '../lib/prisma';

export type SupportSegmentId =
    | 'FREE'
    | 'PRO'
    | 'PROMOTE_MUSIC'
    | 'RELEASE_DISTRIBUTE'
    | 'GROWTH_ENGINE';

const SUPPORT_SEGMENT_LABELS: Record<SupportSegmentId, string> = {
    FREE: 'Free user',
    PRO: 'Pro subscriber',
    PROMOTE_MUSIC: 'Promote your music',
    RELEASE_DISTRIBUTE: 'Release / distribute plan',
    GROWTH_ENGINE: 'Growth Engine',
};

const SEGMENT_PRIORITY: SupportSegmentId[] = [
    'GROWTH_ENGINE',
    'RELEASE_DISTRIBUTE',
    'PROMOTE_MUSIC',
    'PRO',
    'FREE',
];

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

function getStringField(record: Record<string, unknown> | null, key: string) {
    return record ? normalizeString(record[key]) : '';
}

function getPlanLabel(formData: Record<string, unknown> | null) {
    const plan = formData?.plan;

    if (plan && typeof plan === 'object') {
        const planRecord = plan as Record<string, unknown>;
        const title = normalizeString(planRecord.title);

        if (title) {
            return title;
        }
    }

    const pricingMeta = formData?.pricingMeta;
    if (pricingMeta && typeof pricingMeta === 'object') {
        const pricingPlan = (pricingMeta as Record<string, unknown>).plan;
        if (pricingPlan && typeof pricingPlan === 'object') {
            const title = normalizeString((pricingPlan as Record<string, unknown>).title);
            if (title) {
                return title;
            }
        }
    }

    return getStringField(formData, 'planId') || getStringField(formData, 'plan') || null;
}

function getSubmissionKind(submission: {
    service?: { name: string } | null;
    serviceId?: string | null;
    formData: string | null;
}): SupportSegmentId | null {
    const formData = parseJsonRecord(submission.formData);
    const serviceType = getStringField(formData, 'serviceType').toLowerCase();
    const serviceName = normalizeString(submission.service?.name).toLowerCase();
    const serviceId = normalizeString(submission.serviceId).toLowerCase();
    const hasPromotionShape = !!(
        getStringField(formData, 'linkToSong') ||
        getStringField(formData, 'instagramHandle') ||
        (Array.isArray(formData?.selectedServices) && formData.selectedServices.length)
    );

    if (serviceType.includes('growth') || serviceName.includes('growth') || serviceId.includes('growth-engine')) {
        return 'GROWTH_ENGINE';
    }

    if (serviceType.includes('release') || serviceName.includes('release') || serviceId.includes('release-music')) {
        return 'RELEASE_DISTRIBUTE';
    }

    if (
        serviceType.includes('promote') ||
        serviceName.includes('promote') ||
        serviceName.includes('promotion') ||
        hasPromotionShape
    ) {
        return 'PROMOTE_MUSIC';
    }

    return null;
}

function isMeaningfulSubmission(submission: {
    status: string;
    paymentStatus: string;
    payment?: { status: string } | null;
    paymentRequired: boolean;
}) {
    if (submission.paymentStatus === 'PAID' || submission.payment?.status === 'COMPLETED') {
        return true;
    }

    if (['REFUND_PENDING', 'REFUND_FAILED', 'REFUNDED'].includes(submission.paymentStatus)) {
        return true;
    }

    return !submission.paymentRequired && ['PENDING', 'APPROVED'].includes(submission.status);
}

export function sanitizeSupportText(value: unknown, maxLength = 4000) {
    return normalizeString(value).replace(/\s+\n/g, '\n').slice(0, maxLength);
}

export function buildMessagePreview(value: string) {
    const preview = value.replace(/\s+/g, ' ').trim();
    return preview.length > 140 ? `${preview.slice(0, 137)}...` : preview;
}

export function getSupportSegmentLabel(segment: string) {
    return SUPPORT_SEGMENT_LABELS[segment as SupportSegmentId] || SUPPORT_SEGMENT_LABELS.FREE;
}

export function parseSegmentTags(value: string | null) {
    if (!value) {
        return ['FREE'];
    }

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            const tags = parsed
                .map(item => normalizeString(item).toUpperCase())
                .filter((item): item is SupportSegmentId => item in SUPPORT_SEGMENT_LABELS);
            return tags.length ? [...new Set(tags)] : ['FREE'];
        }
    } catch {
        // Fall through to the default tag.
    }

    return ['FREE'];
}

export async function buildSupportCustomerProfile(userId: string) {
    const [user, submissions, payments] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                isPro: true,
                proExpiresAt: true,
                genre: true,
                city: true,
                state: true,
                country: true,
                createdAt: true,
            },
        }),
        prisma.submission.findMany({
            where: {
                userId,
                type: 'service',
            },
            include: {
                service: true,
                payment: true,
            },
            orderBy: [
                { paymentCompletedAt: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 12,
        }),
        prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 8,
            include: {
                submission: {
                    include: {
                        service: true,
                    },
                },
            },
        }),
    ]);

    const tags = new Set<SupportSegmentId>();

    if (user?.isPro) {
        tags.add('PRO');
    }

    for (const submission of submissions) {
        const kind = getSubmissionKind(submission);

        if (kind && isMeaningfulSubmission(submission)) {
            tags.add(kind);
        }
    }

    if (!tags.size) {
        tags.add('FREE');
    }

    const segmentTags = SEGMENT_PRIORITY.filter(segment => tags.has(segment));
    const sourceSegment = segmentTags[0] || 'FREE';

    return {
        user,
        sourceSegment,
        sourceSegmentLabel: getSupportSegmentLabel(sourceSegment),
        segmentTags,
        segmentTagLabels: segmentTags.map(tag => ({
            id: tag,
            label: getSupportSegmentLabel(tag),
        })),
        latestSubmissions: submissions.map(submission => {
            const formData = parseJsonRecord(submission.formData);
            const kind = getSubmissionKind(submission) || 'FREE';

            return {
                id: submission.id,
                kind,
                kindLabel: getSupportSegmentLabel(kind),
                serviceName: submission.service?.name || 'Service',
                planLabel: getPlanLabel(formData),
                status: submission.status,
                paymentStatus: submission.paymentStatus,
                paymentRequired: submission.paymentRequired,
                paymentAmount: submission.paymentAmount,
                paymentCurrency: submission.paymentCurrency,
                paymentCompletedAt: submission.paymentCompletedAt || submission.payment?.completedAt || null,
                createdAt: submission.createdAt,
            };
        }),
        latestPayments: payments.map(payment => ({
            id: payment.id,
            type: payment.type,
            description: payment.description,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            completedAt: payment.completedAt,
            createdAt: payment.createdAt,
            serviceName: payment.submission?.service?.name || null,
        })),
    };
}

export async function buildSupportSegmentSnapshot(userId: string) {
    const profile = await buildSupportCustomerProfile(userId);

    return {
        sourceSegment: profile.sourceSegment,
        segmentTags: profile.segmentTags,
    };
}
