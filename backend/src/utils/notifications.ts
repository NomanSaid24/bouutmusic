import prisma from '../lib/prisma';
import { buildMessagePreview } from './support';

type NotificationPayload = {
    type: string;
    title: string;
    message: string;
    link?: string | null;
};

function normalizeString(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

export function sanitizeNotificationText(value: unknown, maxLength = 2000) {
    return normalizeString(value).slice(0, maxLength);
}

export async function createUserNotification(userId: string, payload: NotificationPayload) {
    if (!userId || !payload.title || !payload.message) {
        return null;
    }

    return prisma.notification.create({
        data: {
            userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            link: payload.link || null,
        },
    });
}

export async function createNotificationsForUsers(userIds: string[], payload: NotificationPayload) {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

    if (!uniqueUserIds.length || !payload.title || !payload.message) {
        return 0;
    }

    const result = await prisma.notification.createMany({
        data: uniqueUserIds.map(userId => ({
            userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            link: payload.link || null,
        })),
    });

    return result.count;
}

export async function getAdminUserIds() {
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
    });

    return admins.map(admin => admin.id);
}

export async function notifyAdmins(payload: NotificationPayload) {
    const adminIds = await getAdminUserIds();
    return createNotificationsForUsers(adminIds, payload);
}

export async function notifyUserAndAdmins(userId: string, userPayload: NotificationPayload, adminPayload?: NotificationPayload) {
    const [userNotification, adminCount] = await Promise.all([
        createUserNotification(userId, userPayload),
        notifyAdmins(adminPayload || userPayload),
    ]);

    return {
        userNotification,
        adminCount,
    };
}

export async function createSupportChatFromAdmin(options: {
    userId: string;
    adminId: string;
    title: string;
    message: string;
    type?: string;
}) {
    const subject = sanitizeNotificationText(options.title, 120) || 'Bouut Music announcement';
    const content = sanitizeNotificationText(options.message, 4000);

    if (!options.userId || !options.adminId || !content) {
        return null;
    }

    return prisma.$transaction(async tx => {
        const conversation = await tx.supportConversation.create({
            data: {
                userId: options.userId,
                assignedAdminId: options.adminId,
                subject,
                status: 'WAITING_USER',
                priority: options.type === 'alert' ? 'HIGH' : 'NORMAL',
                sourceSegment: 'FREE',
                segmentTags: JSON.stringify(['FREE']),
                lastMessagePreview: buildMessagePreview(content),
                lastMessageAt: new Date(),
                unreadForUser: 1,
            },
        });

        await tx.supportMessage.create({
            data: {
                conversationId: conversation.id,
                senderId: options.adminId,
                senderRole: 'ADMIN',
                content,
            },
        });

        return conversation;
    });
}
