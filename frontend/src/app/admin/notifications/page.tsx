'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Bell,
    CheckCircle2,
    Clock3,
    Inbox,
    Mail,
    MessageCircle,
    RefreshCw,
    Send,
    ShieldCheck,
    Users,
    Zap,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './AdminNotificationsPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type AudienceKey =
    | 'ALL_USERS'
    | 'ARTISTS'
    | 'PRO'
    | 'FREE'
    | 'GROWTH_ENGINE'
    | 'RELEASE_DISTRIBUTE'
    | 'PROMOTE_MUSIC';

type AudienceCounts = Record<AudienceKey, number>;

type AdminNotification = {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    link?: string | null;
    createdAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        isPro: boolean;
    };
};

type Broadcast = {
    id: string;
    title: string;
    message: string;
    audience: AudienceKey;
    channels: string[];
    recipientCount: number;
    notificationCount: number;
    chatCount: number;
    emailSentCount: number;
    emailSkippedCount: number;
    createdAt: string;
};

const AUDIENCES: Array<{ id: AudienceKey; label: string; description: string }> = [
    { id: 'ALL_USERS', label: 'All Users', description: 'Every non-admin account' },
    { id: 'ARTISTS', label: 'Artists', description: 'Artist accounts only' },
    { id: 'PRO', label: 'Pro Subscribers', description: 'Users with active Pro access' },
    { id: 'FREE', label: 'Free Users', description: 'Non-Pro users and artists' },
    { id: 'GROWTH_ENGINE', label: 'Growth Engine', description: 'Growth Engine plan users' },
    { id: 'RELEASE_DISTRIBUTE', label: 'Release / Distribute', description: 'Release plan users' },
    { id: 'PROMOTE_MUSIC', label: 'Promote Music', description: 'Promotion plan users' },
];

const EMPTY_COUNTS: AudienceCounts = {
    ALL_USERS: 0,
    ARTISTS: 0,
    PRO: 0,
    FREE: 0,
    GROWTH_ENGINE: 0,
    RELEASE_DISTRIBUTE: 0,
    PROMOTE_MUSIC: 0,
};

function getErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
        const error = (payload as { error?: unknown }).error;

        if (typeof error === 'string') {
            return error;
        }
    }

    return fallback;
}

function formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Recently';
    }

    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getAudienceLabel(audience: string) {
    return AUDIENCES.find(item => item.id === audience)?.label || audience;
}

export default function AdminNotificationsPage() {
    const { token } = useAuth();
    const [audience, setAudience] = useState<AudienceKey>('ALL_USERS');
    const [kind, setKind] = useState<'announcement' | 'alert' | 'email'>('announcement');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('/dashboard/messages');
    const [sendInApp, setSendInApp] = useState(true);
    const [sendChat, setSendChat] = useState(true);
    const [sendEmail, setSendEmail] = useState(true);
    const [audienceCounts, setAudienceCounts] = useState<AudienceCounts>(EMPTY_COUNTS);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedAudienceCount = audienceCounts[audience] || 0;
    const unreadAdminCount = useMemo(
        () => notifications.filter(notification => !notification.read && notification.user?.role === 'ADMIN').length,
        [notifications],
    );

    const loadNotifications = useCallback(async () => {
        if (!token) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const payload = await response.json().catch(() => null) as {
                notifications: AdminNotification[];
                broadcasts: Broadcast[];
                audienceCounts: AudienceCounts;
            } | { error?: string } | null;

            if (!response.ok || !payload || !('notifications' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to load notifications.'));
            }

            setNotifications(payload.notifications);
            setBroadcasts(payload.broadcasts);
            setAudienceCounts({ ...EMPTY_COUNTS, ...payload.audienceCounts });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unable to load notifications.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        void loadNotifications();
    }, [loadNotifications]);

    async function sendBroadcast(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token || isSending) {
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/notifications/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    audience,
                    kind,
                    title,
                    message,
                    link,
                    sendInApp,
                    sendChat,
                    sendEmail,
                }),
            });
            const payload = await response.json().catch(() => null) as {
                counts: {
                    recipients: number;
                    notifications: number;
                    chats: number;
                    emailsSent: number;
                    emailsSkipped: number;
                };
            } | { error?: string } | null;

            if (!response.ok || !payload || !('counts' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to send broadcast.'));
            }

            await Swal.fire({
                icon: 'success',
                title: 'Broadcast sent',
                html: `
                    <div style="text-align:left">
                        <strong>${payload.counts.recipients}</strong> recipients<br/>
                        <strong>${payload.counts.notifications}</strong> notifications<br/>
                        <strong>${payload.counts.chats}</strong> support chats<br/>
                        <strong>${payload.counts.emailsSent}</strong> emails sent
                    </div>
                `,
                confirmButtonColor: '#df5b62',
            });

            setTitle('');
            setMessage('');
            await loadNotifications();
        } catch (sendError) {
            const messageText = sendError instanceof Error ? sendError.message : 'Unable to send broadcast.';
            setError(messageText);
            await Swal.fire({
                icon: 'error',
                title: 'Broadcast failed',
                text: messageText,
                confirmButtonColor: '#df5b62',
            });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.page}>
            <header className={styles.hero}>
                <div>
                    <span className={styles.kicker}><Bell size={16} /> Push Notifications</span>
                    <h1>Notifications Center</h1>
                    <p>Send alerts, announcements, support-chat messages, and email broadcasts to artists.</p>
                </div>
                <div className={styles.heroStats}>
                    <span><Users size={16} /> {audienceCounts.ALL_USERS} users</span>
                    <span><ShieldCheck size={16} /> {audienceCounts.PRO} pro</span>
                    <span><Zap size={16} /> {unreadAdminCount} admin unread</span>
                </div>
            </header>

            {error ? <div className={styles.error}>{error}</div> : null}

            <div className={styles.layout}>
                <form className={styles.composer} onSubmit={sendBroadcast}>
                    <div className={styles.panelHead}>
                        <div>
                            <h2>Compose Broadcast</h2>
                            <p>Every broadcast can create an in-app notification, support chat, and email.</p>
                        </div>
                        <button type="button" onClick={() => void loadNotifications()}>
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div className={styles.kindSwitch}>
                        {(['announcement', 'alert', 'email'] as const).map(item => (
                            <button
                                key={item}
                                type="button"
                                className={kind === item ? styles.isActive : ''}
                                onClick={() => setKind(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label>Target Audience</label>
                        <div className={styles.audienceGrid}>
                            {AUDIENCES.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={audience === item.id ? styles.selectedAudience : ''}
                                    onClick={() => setAudience(item.id)}
                                >
                                    <strong>{item.label}</strong>
                                    <span>{item.description}</span>
                                    <em>{audienceCounts[item.id] || 0}</em>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.fieldGrid}>
                        <div>
                            <label>Notification Title</label>
                            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="E.g., Release plan update" required maxLength={140} />
                        </div>
                        <div>
                            <label>Action Link</label>
                            <input value={link} onChange={event => setLink(event.target.value)} placeholder="/dashboard/messages" />
                        </div>
                    </div>

                    <div>
                        <label>Message Body</label>
                        <textarea value={message} onChange={event => setMessage(event.target.value)} rows={6} placeholder="Type the announcement..." required maxLength={4000} />
                    </div>

                    <div className={styles.channels}>
                        <label className={sendInApp ? styles.enabled : ''}>
                            <input type="checkbox" checked={sendInApp} onChange={event => setSendInApp(event.target.checked)} />
                            <Bell size={16} />
                            In-app notification
                        </label>
                        <label className={sendChat ? styles.enabled : ''}>
                            <input type="checkbox" checked={sendChat} onChange={event => setSendChat(event.target.checked)} />
                            <MessageCircle size={16} />
                            Support chat
                        </label>
                        <label className={sendEmail ? styles.enabled : ''}>
                            <input type="checkbox" checked={sendEmail} onChange={event => setSendEmail(event.target.checked)} />
                            <Mail size={16} />
                            Email broadcast
                        </label>
                    </div>

                    <button className={styles.sendButton} disabled={isSending || !title.trim() || !message.trim()}>
                        {isSending ? <Clock3 size={18} /> : <Send size={18} />}
                        Send to {selectedAudienceCount} recipient{selectedAudienceCount === 1 ? '' : 's'}
                    </button>
                </form>

                <aside className={styles.sidePanel}>
                    <section>
                        <h3><Inbox size={16} /> Recent Broadcasts</h3>
                        {isLoading ? (
                            <div className={styles.empty}>Loading broadcasts...</div>
                        ) : broadcasts.length ? (
                            <div className={styles.broadcastList}>
                                {broadcasts.map(broadcast => (
                                    <article key={broadcast.id} className={styles.broadcastItem}>
                                        <strong>{broadcast.title}</strong>
                                        <span>{getAudienceLabel(broadcast.audience)} - {broadcast.recipientCount} recipients</span>
                                        <em>{broadcast.channels.join(', ') || 'No channels'} - {formatDateTime(broadcast.createdAt)}</em>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>No broadcasts yet.</div>
                        )}
                    </section>
                </aside>
            </div>

            <section className={styles.feedPanel}>
                <div className={styles.panelHead}>
                    <div>
                        <h2>All User Notifications</h2>
                        <p>Admin can see notification records created for users and artists.</p>
                    </div>
                    <CheckCircle2 size={18} />
                </div>

                <div className={styles.feedList}>
                    {notifications.length ? notifications.map(notification => (
                        <article key={notification.id} className={styles.feedItem}>
                            <div>
                                <strong>{notification.title}</strong>
                                <p>{notification.message}</p>
                                <span>{notification.user?.name || 'Unknown user'} - {notification.user?.email || 'No email'}</span>
                            </div>
                            <aside>
                                <span>{notification.type}</span>
                                <em>{formatDateTime(notification.createdAt)}</em>
                            </aside>
                        </article>
                    )) : (
                        <div className={styles.empty}>No notifications found.</div>
                    )}
                </div>
            </section>
        </motion.div>
    );
}
