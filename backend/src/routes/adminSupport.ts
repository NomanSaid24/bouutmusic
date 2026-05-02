import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { normalizeUserMedia } from '../utils/media';
import {
    buildMessagePreview,
    buildSupportCustomerProfile,
    getSupportSegmentLabel,
    parseSegmentTags,
    sanitizeSupportText,
} from '../utils/support';

const router = Router();
router.use(authenticate, requireAdmin);

const VALID_STATUSES = new Set(['OPEN', 'WAITING_USER', 'RESOLVED']);
const VALID_PRIORITIES = new Set(['LOW', 'NORMAL', 'HIGH', 'URGENT']);
const VALID_SEGMENTS = new Set(['FREE', 'PRO', 'PROMOTE_MUSIC', 'RELEASE_DISTRIBUTE', 'GROWTH_ENGINE']);

function normalizeString(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function formatSupportUser(user: any) {
    return user ? normalizeUserMedia(user) : null;
}

function formatConversation(conversation: any) {
    const segmentTags = parseSegmentTags(conversation.segmentTags);
    const latestMessage = Array.isArray(conversation.messages) ? conversation.messages[0] : null;

    return {
        id: conversation.id,
        subject: conversation.subject,
        status: conversation.status,
        priority: conversation.priority,
        sourceSegment: conversation.sourceSegment,
        sourceSegmentLabel: getSupportSegmentLabel(conversation.sourceSegment),
        segmentTags,
        segmentTagLabels: segmentTags.map(tag => ({
            id: tag,
            label: getSupportSegmentLabel(tag),
        })),
        lastMessagePreview: conversation.lastMessagePreview || latestMessage?.content || '',
        lastMessageAt: conversation.lastMessageAt,
        unreadForAdmin: conversation.unreadForAdmin,
        unreadForUser: conversation.unreadForUser,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        user: formatSupportUser(conversation.user),
        assignedAdmin: formatSupportUser(conversation.assignedAdmin),
        latestMessage: latestMessage
            ? {
                id: latestMessage.id,
                content: latestMessage.content,
                senderRole: latestMessage.senderRole,
                createdAt: latestMessage.createdAt,
            }
            : null,
    };
}

function formatMessage(message: any) {
    return {
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        senderRole: message.senderRole,
        senderId: message.senderId,
        readAt: message.readAt,
        createdAt: message.createdAt,
        sender: formatSupportUser(message.sender),
    };
}

function buildConversationWhere(query: any) {
    const status = normalizeString(query.status).toUpperCase();
    const segment = normalizeString(query.segment).toUpperCase();
    const search = normalizeString(query.search);
    const where: any = {};

    if (status && status !== 'ALL' && VALID_STATUSES.has(status)) {
        where.status = status;
    }

    if (segment && segment !== 'ALL' && VALID_SEGMENTS.has(segment)) {
        where.sourceSegment = segment;
    }

    if (search) {
        where.OR = [
            { subject: { contains: search } },
            { lastMessagePreview: { contains: search } },
            { user: { is: { name: { contains: search } } } },
            { user: { is: { email: { contains: search } } } },
        ];
    }

    return where;
}

async function fetchConversationForAdmin(id: string) {
    return prisma.supportConversation.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    role: true,
                    isPro: true,
                    genre: true,
                    city: true,
                    state: true,
                    country: true,
                    createdAt: true,
                },
            },
            assignedAdmin: {
                select: { id: true, name: true, email: true, avatar: true, role: true },
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
    });
}

// GET /api/admin/support/conversations
router.get('/conversations', async (req: AuthRequest, res: Response) => {
    try {
        const where = buildConversationWhere(req.query);
        const [conversations, total, open, waitingUser, resolved, unread] = await Promise.all([
            prisma.supportConversation.findMany({
                where,
                orderBy: { lastMessageAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            role: true,
                            isPro: true,
                            genre: true,
                            city: true,
                            country: true,
                            createdAt: true,
                        },
                    },
                    assignedAdmin: {
                        select: { id: true, name: true, email: true, avatar: true, role: true },
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
                take: 80,
            }),
            prisma.supportConversation.count({ where }),
            prisma.supportConversation.count({ where: { status: 'OPEN' } }),
            prisma.supportConversation.count({ where: { status: 'WAITING_USER' } }),
            prisma.supportConversation.count({ where: { status: 'RESOLVED' } }),
            prisma.supportConversation.count({ where: { unreadForAdmin: { gt: 0 } } }),
        ]);

        res.json({
            conversations: conversations.map(formatConversation),
            stats: {
                total,
                open,
                waitingUser,
                resolved,
                unread,
            },
        });
    } catch (error) {
        console.error('Failed to fetch admin support inbox:', error);
        res.status(500).json({ error: 'Failed to fetch support inbox' });
    }
});

// GET /api/admin/support/conversations/:id
router.get('/conversations/:id', async (req: AuthRequest, res: Response) => {
    try {
        const exists = await prisma.supportConversation.findUnique({
            where: { id: req.params.id },
            select: { id: true, userId: true },
        });

        if (!exists) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        await prisma.$transaction([
            prisma.supportMessage.updateMany({
                where: {
                    conversationId: exists.id,
                    senderRole: { not: 'ADMIN' },
                    readAt: null,
                },
                data: { readAt: new Date() },
            }),
            prisma.supportConversation.update({
                where: { id: exists.id },
                data: { unreadForAdmin: 0 },
            }),
        ]);

        const [conversation, messages, customerProfile] = await Promise.all([
            fetchConversationForAdmin(exists.id),
            prisma.supportMessage.findMany({
                where: { conversationId: exists.id },
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, avatar: true, role: true },
                    },
                },
                take: 150,
            }),
            buildSupportCustomerProfile(exists.userId),
        ]);

        res.json({
            conversation: formatConversation(conversation),
            messages: messages.map(formatMessage),
            customerProfile,
        });
    } catch (error) {
        console.error('Failed to fetch admin support conversation:', error);
        res.status(500).json({ error: 'Failed to fetch support conversation' });
    }
});

// POST /api/admin/support/conversations/:id/messages
router.post('/conversations/:id/messages', async (req: AuthRequest, res: Response) => {
    try {
        const content = sanitizeSupportText(req.body.content);

        if (!content) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const conversation = await prisma.supportConversation.findUnique({
            where: { id: req.params.id },
            select: { id: true, assignedAdminId: true },
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const message = await prisma.$transaction(async tx => {
            const createdMessage = await tx.supportMessage.create({
                data: {
                    conversationId: conversation.id,
                    senderId: req.user!.id,
                    senderRole: 'ADMIN',
                    content,
                },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, avatar: true, role: true },
                    },
                },
            });

            await tx.supportConversation.update({
                where: { id: conversation.id },
                data: {
                    assignedAdminId: conversation.assignedAdminId || req.user!.id,
                    status: 'WAITING_USER',
                    lastMessagePreview: buildMessagePreview(content),
                    lastMessageAt: createdMessage.createdAt,
                    unreadForUser: { increment: 1 },
                },
            });

            return createdMessage;
        });

        res.status(201).json(formatMessage(message));
    } catch (error) {
        console.error('Failed to send admin support reply:', error);
        res.status(500).json({ error: 'Failed to send support reply' });
    }
});

// PATCH /api/admin/support/conversations/:id
router.patch('/conversations/:id', async (req: AuthRequest, res: Response) => {
    try {
        const status = normalizeString(req.body.status).toUpperCase();
        const priority = normalizeString(req.body.priority).toUpperCase();
        const assignedAdminId = normalizeString(req.body.assignedAdminId);
        const assignToMe = req.body.assignToMe === true;
        const data: any = {};

        if (status) {
            if (!VALID_STATUSES.has(status)) {
                return res.status(400).json({ error: 'Invalid support status' });
            }
            data.status = status;
        }

        if (priority) {
            if (!VALID_PRIORITIES.has(priority)) {
                return res.status(400).json({ error: 'Invalid priority' });
            }
            data.priority = priority;
        }

        if (assignToMe) {
            data.assignedAdminId = req.user!.id;
        } else if (assignedAdminId === 'unassigned') {
            data.assignedAdminId = null;
        } else if (assignedAdminId) {
            const admin = await prisma.user.findFirst({
                where: {
                    id: assignedAdminId,
                    role: 'ADMIN',
                },
                select: { id: true },
            });

            if (!admin) {
                return res.status(400).json({ error: 'Assigned admin not found' });
            }

            data.assignedAdminId = admin.id;
        }

        const updated = await prisma.supportConversation.update({
            where: { id: req.params.id },
            data,
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true, role: true, isPro: true },
                },
                assignedAdmin: {
                    select: { id: true, name: true, email: true, avatar: true, role: true },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        res.json(formatConversation(updated));
    } catch (error) {
        console.error('Failed to update support conversation:', error);
        res.status(500).json({ error: 'Failed to update support conversation' });
    }
});

export default router;
