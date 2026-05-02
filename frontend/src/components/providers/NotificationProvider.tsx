'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type AppNotification = {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    link?: string | null;
    createdAt: string;
};

type NotificationContextValue = {
    notifications: AppNotification[];
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
    markNotificationRead: (id: string) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function getSweetAlertIcon(type: string): 'success' | 'error' | 'warning' | 'info' {
    const normalized = type.toLowerCase();

    if (normalized.includes('rejected') || normalized.includes('failed')) {
        return 'warning';
    }

    if (normalized.includes('paid') || normalized.includes('approved') || normalized.includes('success')) {
        return 'success';
    }

    if (normalized.includes('alert')) {
        return 'warning';
    }

    return 'info';
}

function getErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
        const error = (payload as { error?: unknown }).error;

        if (typeof error === 'string') {
            return error;
        }
    }

    return fallback;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { token, isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const knownIdsRef = useRef<Set<string>>(new Set());
    const hasHydratedRef = useRef(false);

    const showRuntimeNotification = useCallback((notification: AppNotification) => {
        void Swal.fire({
            toast: true,
            position: 'top-end',
            icon: getSweetAlertIcon(notification.type),
            title: notification.title,
            text: notification.message,
            timer: 5200,
            timerProgressBar: true,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                popup: 'bouut-swal-toast',
            },
        });
    }, []);

    const refreshNotifications = useCallback(async () => {
        if (!token) {
            setNotifications([]);
            setUnreadCount(0);
            knownIdsRef.current = new Set();
            hasHydratedRef.current = false;
            return;
        }

        const response = await fetch(`${API_URL}/api/notifications?limit=30`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        const payload = await response.json().catch(() => null) as {
            notifications: AppNotification[];
            unreadCount: number;
        } | { error?: string } | null;

        if (!response.ok || !payload || !('notifications' in payload)) {
            throw new Error(getErrorMessage(payload, 'Unable to load notifications.'));
        }

        setNotifications(payload.notifications);
        setUnreadCount(payload.unreadCount || 0);

        const nextIds = new Set(payload.notifications.map(notification => notification.id));

        if (!hasHydratedRef.current) {
            knownIdsRef.current = nextIds;
            hasHydratedRef.current = true;
            return;
        }

        const newUnread = payload.notifications
            .filter(notification => !notification.read && !knownIdsRef.current.has(notification.id))
            .reverse();

        knownIdsRef.current = nextIds;

        for (const notification of newUnread) {
            showRuntimeNotification(notification);
        }
    }, [showRuntimeNotification, token]);

    const markNotificationRead = useCallback(async (id: string) => {
        if (!token) {
            return;
        }

        await fetch(`${API_URL}/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(current => current.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification,
        ));
        setUnreadCount(current => Math.max(0, current - 1));
    }, [token]);

    const markAllNotificationsRead = useCallback(async () => {
        if (!token) {
            return;
        }

        await fetch(`${API_URL}/api/notifications/read-all`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(current => current.map(notification => ({ ...notification, read: true })));
        setUnreadCount(0);
    }, [token]);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            knownIdsRef.current = new Set();
            hasHydratedRef.current = false;

            const resetTimer = window.setTimeout(() => {
                setNotifications([]);
                setUnreadCount(0);
            }, 0);

            return () => window.clearTimeout(resetTimer);
        }

        const initialTimer = window.setTimeout(() => {
            void refreshNotifications().catch(() => {
                // Header dropdowns can stay quiet if the network is briefly unavailable.
            });
        }, 0);

        const interval = window.setInterval(() => {
            void refreshNotifications().catch(() => undefined);
        }, 10000);

        return () => {
            window.clearTimeout(initialTimer);
            window.clearInterval(interval);
        };
    }, [isAuthenticated, refreshNotifications, token, user?.id]);

    const value = useMemo<NotificationContextValue>(() => ({
        notifications,
        unreadCount,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
    }), [
        markAllNotificationsRead,
        markNotificationRead,
        notifications,
        refreshNotifications,
        unreadCount,
    ]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }

    return context;
}
