import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { normalizeUserMedia } from '../utils/media';
import {
    buildMessagePreview,
    buildSupportSegmentSnapshot,
    getSupportSegmentLabel,
    parseSegmentTags,
    sanitizeSupportText,
} from '../utils/support';

const router = Router();
router.use(authenticate);

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

async function fetchUserConversation(conversationId: string, userId: string) {
    return prisma.supportConversation.findFirst({
        where: {
            id: conversationId,
            userId,
        },
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
}

// GET /api/support/conversations
router.get('/conversations', async (req: AuthRequest, res: Response) => {
    try {
        const conversations = await prisma.supportConversation.findMany({
            where: { userId: req.user!.id },
            orderBy: { lastMessageAt: 'desc' },
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
            take: 50,
        });

        res.json(conversations.map(formatConversation));
    } catch (error) {
        console.error('Failed to fetch support conversations:', error);
        res.status(500).json({ error: 'Failed to fetch support conversations' });
    }
});

// POST /api/support/conversations
router.post('/conversations', async (req: AuthRequest, res: Response) => {
    try {
        const content = sanitizeSupportText(req.body.content);
        const subject = sanitizeSupportText(req.body.subject, 120) || buildMessagePreview(content).slice(0, 80) || 'Support request';

        if (!content) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const segment = await buildSupportSegmentSnapshot(req.user!.id);
        const preview = buildMessagePreview(content);

        const conversation = await prisma.$transaction(async tx => {
            const createdConversation = await tx.supportConversation.create({
                data: {
                    userId: req.user!.id,
                    subject,
                    sourceSegment: segment.sourceSegment,
                    segmentTags: JSON.stringify(segment.segmentTags),
                    lastMessagePreview: preview,
                    lastMessageAt: new Date(),
                    unreadForAdmin: 1,
                },
            });

            await tx.supportMessage.create({
                data: {
                    conversationId: createdConversation.id,
                    senderId: req.user!.id,
                    senderRole: req.user!.role,
                    content,
                },
            });

            return tx.supportConversation.findUnique({
                where: { id: createdConversation.id },
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
        });

        res.status(201).json(formatConversation(conversation));
    } catch (error) {
        console.error('Failed to create support conversation:', error);
        res.status(500).json({ error: 'Failed to create support conversation' });
    }
});

// GET /api/support/conversations/:id/messages
router.get('/conversations/:id/messages', async (req: AuthRequest, res: Response) => {
    try {
        const conversation = await prisma.supportConversation.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id,
            },
            select: { id: true },
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        await prisma.$transaction([
            prisma.supportMessage.updateMany({
                where: {
                    conversationId: conversation.id,
                    senderId: { not: req.user!.id },
                    readAt: null,
                },
                data: { readAt: new Date() },
            }),
            prisma.supportConversation.update({
                where: { id: conversation.id },
                data: { unreadForUser: 0 },
            }),
        ]);

        const [freshConversation, messages] = await Promise.all([
            fetchUserConversation(conversation.id, req.user!.id),
            prisma.supportMessage.findMany({
                where: { conversationId: conversation.id },
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, avatar: true, role: true },
                    },
                },
                take: 100,
            }),
        ]);

        res.json({
            conversation: formatConversation(freshConversation),
            messages: messages.map(formatMessage),
        });
    } catch (error) {
        console.error('Failed to fetch support messages:', error);
        res.status(500).json({ error: 'Failed to fetch support messages' });
    }
});

// POST /api/support/conversations/:id/messages
router.post('/conversations/:id/messages', async (req: AuthRequest, res: Response) => {
    try {
        const content = sanitizeSupportText(req.body.content);

        if (!content) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const conversation = await prisma.supportConversation.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id,
            },
            select: { id: true },
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const message = await prisma.$transaction(async tx => {
            const createdMessage = await tx.supportMessage.create({
                data: {
                    conversationId: conversation.id,
                    senderId: req.user!.id,
                    senderRole: req.user!.role,
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
                    status: 'OPEN',
                    lastMessagePreview: buildMessagePreview(content),
                    lastMessageAt: createdMessage.createdAt,
                    unreadForAdmin: { increment: 1 },
                },
            });

            return createdMessage;
        });

        res.status(201).json(formatMessage(message));
    } catch (error) {
        console.error('Failed to send support message:', error);
        res.status(500).json({ error: 'Failed to send support message' });
    }
});

export default router;
