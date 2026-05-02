import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { sendTransactionalEmail } from '../lib/mailer';
import {
    createNotificationsForUsers,
    createSupportChatFromAdmin,
    notifyAdmins,
    sanitizeNotificationText,
} from '../utils/notifications';

const router = Router();
router.use(authenticate, requireAdmin);

type Audience =
    | 'ALL_USERS'
    | 'ARTISTS'
    | 'PRO'
    | 'FREE'
    | 'GROWTH_ENGINE'
    | 'RELEASE_DISTRIBUTE'
    | 'PROMOTE_MUSIC';

const VALID_AUDIENCES = new Set<Audience>([
    'ALL_USERS',
    'ARTISTS',
    'PRO',
    'FREE',
    'GROWTH_ENGINE',
    'RELEASE_DISTRIBUTE',
    'PROMOTE_MUSIC',
]);

function normalizeString(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function parseJsonList(value: string | null) {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(item => normalizeString(item)).filter(Boolean) : [];
    } catch {
        return [];
    }
}

function buildAudienceWhere(audience: Audience) {
    if (audience === 'ARTISTS') {
        return { role: 'ARTIST' };
    }

    if (audience === 'PRO') {
        return {
            role: { not: 'ADMIN' },
            isPro: true,
        };
    }

    if (audience === 'FREE') {
        return {
            role: { not: 'ADMIN' },
            isPro: false,
        };
    }

    return {
        role: { not: 'ADMIN' },
    };
}

async function getSubmissionAudienceUserIds(kind: Audience) {
    const serviceOr = kind === 'GROWTH_ENGINE'
        ? [
            { serviceId: 'growth-engine-service' },
            { formData: { contains: 'growth-engine' } },
            { service: { is: { name: { contains: 'Growth' } } } },
        ]
        : kind === 'RELEASE_DISTRIBUTE'
            ? [
                { serviceId: 'release-music-service' },
                { formData: { contains: 'release-music' } },
                { service: { is: { name: { contains: 'Release' } } } },
            ]
            : [
                { formData: { contains: 'linkToSong' } },
                { formData: { contains: 'selectedServices' } },
                { service: { is: { name: { contains: 'Promote' } } } },
                { service: { is: { name: { contains: 'Promotion' } } } },
            ];

    const submissions = await prisma.submission.findMany({
        where: {
            type: 'service',
            OR: serviceOr,
        },
        select: { userId: true },
    });

    return [...new Set(submissions.map(submission => submission.userId))];
}

async function getAudienceUsers(audience: Audience) {
    if (audience === 'GROWTH_ENGINE' || audience === 'RELEASE_DISTRIBUTE' || audience === 'PROMOTE_MUSIC') {
        const ids = await getSubmissionAudienceUserIds(audience);

        if (!ids.length) {
            return [];
        }

        return prisma.user.findMany({
            where: {
                id: { in: ids },
                role: { not: 'ADMIN' },
            },
            select: { id: true, name: true, email: true, role: true, isPro: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    return prisma.user.findMany({
        where: buildAudienceWhere(audience),
        select: { id: true, name: true, email: true, role: true, isPro: true },
        orderBy: { createdAt: 'desc' },
    });
}

async function getAudienceCounts() {
    const [allUsers, artists, pro, free, growthIds, releaseIds, promoteIds] = await Promise.all([
        prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
        prisma.user.count({ where: { role: 'ARTIST' } }),
        prisma.user.count({ where: { role: { not: 'ADMIN' }, isPro: true } }),
        prisma.user.count({ where: { role: { not: 'ADMIN' }, isPro: false } }),
        getSubmissionAudienceUserIds('GROWTH_ENGINE'),
        getSubmissionAudienceUserIds('RELEASE_DISTRIBUTE'),
        getSubmissionAudienceUserIds('PROMOTE_MUSIC'),
    ]);

    return {
        ALL_USERS: allUsers,
        ARTISTS: artists,
        PRO: pro,
        FREE: free,
        GROWTH_ENGINE: growthIds.length,
        RELEASE_DISTRIBUTE: releaseIds.length,
        PROMOTE_MUSIC: promoteIds.length,
    };
}

// GET /api/admin/notifications
router.get('/', async (_req: AuthRequest, res: Response) => {
    try {
        const [notifications, broadcasts, audienceCounts, unreadAdminCount] = await Promise.all([
            prisma.notification.findMany({
                orderBy: { createdAt: 'desc' },
                take: 200,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true, isPro: true },
                    },
                },
            }),
            prisma.notificationBroadcast.findMany({
                orderBy: { createdAt: 'desc' },
                take: 25,
            }),
            getAudienceCounts(),
            prisma.notification.count({
                where: {
                    read: false,
                    user: { role: 'ADMIN' },
                },
            }),
        ]);

        res.json({
            notifications,
            broadcasts: broadcasts.map(broadcast => ({
                ...broadcast,
                channels: parseJsonList(broadcast.channels),
            })),
            audienceCounts,
            unreadAdminCount,
        });
    } catch (error) {
        console.error('Failed to fetch admin notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// POST /api/admin/notifications/broadcast
router.post('/broadcast', async (req: AuthRequest, res: Response) => {
    try {
        const title = sanitizeNotificationText(req.body.title, 140);
        const message = sanitizeNotificationText(req.body.message, 4000);
        const audience = normalizeString(req.body.audience).toUpperCase() as Audience;
        const link = sanitizeNotificationText(req.body.link, 300) || '/dashboard/messages';
        const kind = normalizeString(req.body.kind).toLowerCase() || 'announcement';
        const sendEmail = req.body.sendEmail === true;
        const sendChat = req.body.sendChat !== false;
        const sendInApp = req.body.sendInApp !== false;

        if (!title || !message) {
            return res.status(400).json({ error: 'Title and message are required.' });
        }

        if (!VALID_AUDIENCES.has(audience)) {
            return res.status(400).json({ error: 'Please choose a valid audience.' });
        }

        const recipients = await getAudienceUsers(audience);
        const recipientIds = recipients.map(recipient => recipient.id);
        const channels = [
            sendInApp ? 'notification' : '',
            sendChat ? 'support_chat' : '',
            sendEmail ? 'email' : '',
        ].filter(Boolean);

        let notificationCount = 0;
        let chatCount = 0;
        let emailSentCount = 0;
        let emailSkippedCount = 0;

        if (sendInApp) {
            notificationCount = await createNotificationsForUsers(recipientIds, {
                type: `broadcast_${kind}`,
                title,
                message,
                link,
            });
        }

        if (sendChat) {
            for (const recipient of recipients) {
                const created = await createSupportChatFromAdmin({
                    userId: recipient.id,
                    adminId: req.user!.id,
                    title,
                    message,
                    type: kind,
                }).catch(error => {
                    console.error('Failed to create broadcast support chat:', error);
                    return null;
                });

                if (created) {
                    chatCount += 1;
                }
            }
        }

        if (sendEmail) {
            for (const recipient of recipients) {
                const delivery = await sendTransactionalEmail({
                    to: recipient.email,
                    subject: title,
                    text: `${message}\n\nBouut Music`,
                }).catch(error => {
                    console.error('Failed to send broadcast email:', error);
                    return { sent: false, skipped: false, reason: error instanceof Error ? error.message : 'send_failed' };
                });

                if (delivery.sent) {
                    emailSentCount += 1;
                } else {
                    emailSkippedCount += 1;
                }
            }
        }

        const broadcast = await prisma.notificationBroadcast.create({
            data: {
                title,
                message,
                audience,
                channels: JSON.stringify(channels),
                recipientCount: recipients.length,
                notificationCount,
                chatCount,
                emailSentCount,
                emailSkippedCount,
                createdById: req.user!.id,
            },
        });

        await notifyAdmins({
            type: 'admin_broadcast_sent',
            title: 'Broadcast sent',
            message: `${title} was sent to ${recipients.length} recipient${recipients.length === 1 ? '' : 's'}.`,
            link: '/admin/notifications',
        });

        res.status(201).json({
            broadcast: {
                ...broadcast,
                channels,
            },
            counts: {
                recipients: recipients.length,
                notifications: notificationCount,
                chats: chatCount,
                emailsSent: emailSentCount,
                emailsSkipped: emailSkippedCount,
            },
        });
    } catch (error) {
        console.error('Failed to send broadcast:', error);
        res.status(500).json({ error: 'Failed to send broadcast' });
    }
});

export default router;
