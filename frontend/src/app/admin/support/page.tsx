'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    Inbox,
    MessageCircle,
    PanelRightOpen,
    RefreshCw,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    UserCheck,
    WalletCards,
    X,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './SupportInboxPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type SegmentLabel = {
    id: string;
    label: string;
};

type SupportUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    isPro?: boolean;
    genre?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    createdAt?: string;
};

type SupportConversation = {
    id: string;
    subject: string;
    status: string;
    priority: string;
    sourceSegment: string;
    sourceSegmentLabel: string;
    segmentTagLabels: SegmentLabel[];
    lastMessagePreview: string;
    lastMessageAt: string;
    unreadForAdmin: number;
    unreadForUser: number;
    createdAt: string;
    updatedAt: string;
    user: SupportUser | null;
    assignedAdmin?: SupportUser | null;
};

type SupportMessage = {
    id: string;
    conversationId: string;
    content: string;
    senderRole: string;
    senderId: string;
    createdAt: string;
    sender?: SupportUser | null;
};

type CustomerProfile = {
    sourceSegment: string;
    sourceSegmentLabel: string;
    segmentTagLabels: SegmentLabel[];
    latestSubmissions: Array<{
        id: string;
        kind: string;
        kindLabel: string;
        serviceName: string;
        planLabel: string | null;
        status: string;
        paymentStatus: string;
        paymentAmount: number | null;
        paymentCurrency: string | null;
        paymentCompletedAt: string | null;
        createdAt: string;
    }>;
    latestPayments: Array<{
        id: string;
        type: string;
        description: string | null;
        amount: number;
        currency: string;
        status: string;
        completedAt: string | null;
        createdAt: string;
        serviceName: string | null;
    }>;
};

type InboxStats = {
    total: number;
    open: number;
    waitingUser: number;
    resolved: number;
    unread: number;
};

const STATUS_FILTERS = [
    { id: 'ALL', label: 'All' },
    { id: 'OPEN', label: 'Open' },
    { id: 'WAITING_USER', label: 'Answered' },
    { id: 'RESOLVED', label: 'Resolved' },
];

const SEGMENT_FILTERS = [
    { id: 'ALL', label: 'All Segments' },
    { id: 'GROWTH_ENGINE', label: 'Growth Engine' },
    { id: 'RELEASE_DISTRIBUTE', label: 'Release' },
    { id: 'PROMOTE_MUSIC', label: 'Promote' },
    { id: 'PRO', label: 'Pro' },
    { id: 'FREE', label: 'Free' },
];

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

function getErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
        const error = (payload as { error?: unknown }).error;

        if (typeof error === 'string') {
            return error;
        }
    }

    return fallback;
}

function formatDateTime(value: string | null | undefined) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatCurrency(amount: number | null | undefined, currency = 'INR') {
    if (typeof amount !== 'number') {
        return 'No amount';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function getInitials(name?: string | null) {
    return (name || 'BM')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('') || 'BM';
}

function getStatusLabel(status: string) {
    if (status === 'WAITING_USER') return 'Answered';
    if (status === 'RESOLVED') return 'Resolved';
    return 'Open';
}

function getSegmentClass(segment: string) {
    if (segment === 'GROWTH_ENGINE') return styles.segmentGrowth;
    if (segment === 'RELEASE_DISTRIBUTE') return styles.segmentRelease;
    if (segment === 'PROMOTE_MUSIC') return styles.segmentPromote;
    if (segment === 'PRO') return styles.segmentPro;
    return styles.segmentFree;
}

export default function AdminSupportPage() {
    const { token, isLoading: isAuthLoading, openAuthModal } = useAuth();
    const [conversations, setConversations] = useState<SupportConversation[]>([]);
    const [stats, setStats] = useState<InboxStats>({ total: 0, open: 0, waitingUser: 0, resolved: 0, unread: 0 });
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeConversation, setActiveConversation] = useState<SupportConversation | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [segmentFilter, setSegmentFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [reply, setReply] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isThreadLoading, setIsThreadLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeFromList = useMemo(
        () => conversations.find(conversation => conversation.id === activeId) || activeConversation,
        [activeConversation, activeId, conversations],
    );

    const loadInbox = useCallback(async (options?: { silent?: boolean }) => {
        if (!token) {
            return;
        }

        if (!options?.silent) {
            setIsLoading(true);
        }
        setError(null);

        const params = new URLSearchParams();
        params.set('status', statusFilter);
        params.set('segment', segmentFilter);
        if (search.trim()) {
            params.set('search', search.trim());
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/support/conversations?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const payload = await response.json().catch(() => null) as {
                conversations: SupportConversation[];
                stats: InboxStats;
            } | { error?: string } | null;

            if (!response.ok || !payload || !('conversations' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to load support inbox.'));
            }

            setConversations(payload.conversations);
            setStats(payload.stats);
            setActiveId(current => {
                if (current && payload.conversations.some(conversation => conversation.id === current)) {
                    return current;
                }

                return payload.conversations[0]?.id || null;
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unable to load support inbox.');
        } finally {
            if (!options?.silent) {
                setIsLoading(false);
            }
        }
    }, [search, segmentFilter, statusFilter, token]);

    const loadConversation = useCallback(async (conversationId: string, options?: { silent?: boolean }) => {
        if (!token) {
            return;
        }

        if (!options?.silent) {
            setIsThreadLoading(true);
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/support/conversations/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const payload = await response.json().catch(() => null) as {
                conversation: SupportConversation;
                messages: SupportMessage[];
                customerProfile: CustomerProfile;
            } | { error?: string } | null;

            if (!response.ok || !payload || !('conversation' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to load support conversation.'));
            }

            setActiveConversation(payload.conversation);
            setMessages(payload.messages);
            setCustomerProfile(payload.customerProfile);
            setConversations(current => current.map(conversation =>
                conversation.id === payload.conversation.id ? payload.conversation : conversation,
            ));
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unable to load support conversation.');
        } finally {
            if (!options?.silent) {
                setIsThreadLoading(false);
            }
        }
    }, [token]);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }

        if (!token) {
            setIsLoading(false);
            openAuthModal('login', '/admin/support');
            return;
        }

        void loadInbox();
    }, [isAuthLoading, loadInbox, openAuthModal, token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const interval = window.setInterval(() => {
            void loadInbox({ silent: true });
        }, 10000);

        return () => window.clearInterval(interval);
    }, [loadInbox, token]);

    useEffect(() => {
        if (!activeId || !token) {
            setActiveConversation(null);
            setMessages([]);
            setCustomerProfile(null);
            return;
        }

        void loadConversation(activeId);

        const interval = window.setInterval(() => {
            void loadConversation(activeId, { silent: true });
        }, 7000);

        return () => window.clearInterval(interval);
    }, [activeId, loadConversation, token]);

    async function sendReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token || !activeId || isSending) {
            return;
        }

        const content = reply.trim();
        if (!content) {
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/support/conversations/${activeId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content }),
            });
            const payload = await response.json().catch(() => null) as SupportMessage | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to send reply.'));
            }

            setMessages(current => [...current, payload]);
            setReply('');
            await Promise.all([
                loadInbox({ silent: true }),
                loadConversation(activeId, { silent: true }),
            ]);
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : 'Unable to send reply.');
        } finally {
            setIsSending(false);
        }
    }

    async function updateConversation(patch: Record<string, unknown>) {
        if (!token || !activeId) {
            return;
        }

        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/support/conversations/${activeId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(patch),
            });
            const payload = await response.json().catch(() => null) as SupportConversation | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to update conversation.'));
            }

            setActiveConversation(payload);
            setConversations(current => current.map(conversation =>
                conversation.id === payload.id ? payload : conversation,
            ));
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : 'Unable to update conversation.');
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.page}>
            <header className={styles.hero}>
                <div>
                    <span className={styles.kicker}>
                        <MessageCircle size={16} />
                        Support Command Center
                    </span>
                    <h1>Support Inbox</h1>
                    <p>Logged-in artists and users reach admin here.</p>
                </div>
                <div className={styles.stats}>
                    <span><Inbox size={16} /> {stats.total} total</span>
                    <span><AlertCircle size={16} /> {stats.open} open</span>
                    <span><CheckCircle2 size={16} /> {stats.waitingUser} answered</span>
                    <span><Sparkles size={16} /> {stats.unread} unread</span>
                </div>
            </header>

            {error ? <div className={styles.error}>{error}</div> : null}

            <div className={styles.workspace}>
                <aside className={styles.inbox}>
                    <div className={styles.searchBox}>
                        <Search size={16} />
                        <input
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search chats, users, emails..."
                        />
                    </div>

                    <div className={styles.filterStrip}>
                        {STATUS_FILTERS.map(filter => (
                            <button
                                key={filter.id}
                                type="button"
                                className={statusFilter === filter.id ? styles.activeFilter : ''}
                                onClick={() => setStatusFilter(filter.id)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <select
                        className={styles.segmentSelect}
                        value={segmentFilter}
                        onChange={event => setSegmentFilter(event.target.value)}
                    >
                        {SEGMENT_FILTERS.map(filter => (
                            <option key={filter.id} value={filter.id}>{filter.label}</option>
                        ))}
                    </select>

                    <div className={styles.conversationList}>
                        {isLoading ? (
                            <div className={styles.emptyList}>Loading support chats...</div>
                        ) : conversations.length === 0 ? (
                            <div className={styles.emptyList}>No chats match this view.</div>
                        ) : conversations.map(conversation => (
                            <button
                                key={conversation.id}
                                type="button"
                                className={`${styles.conversationButton} ${conversation.id === activeId ? styles.activeConversation : ''}`}
                                onClick={() => setActiveId(conversation.id)}
                            >
                                <span className={styles.conversationTop}>
                                    <span className={`${styles.segmentDot} ${getSegmentClass(conversation.sourceSegment)}`} />
                                    <strong>{conversation.user?.name || 'User'}</strong>
                                    {conversation.unreadForAdmin > 0 ? <em>{conversation.unreadForAdmin}</em> : null}
                                </span>
                                <span className={styles.conversationSubject}>{conversation.subject}</span>
                                <span className={styles.conversationPreview}>{conversation.lastMessagePreview}</span>
                                <span className={styles.conversationMeta}>
                                    <span>{conversation.sourceSegmentLabel}</span>
                                    <span>{formatDateTime(conversation.lastMessageAt)}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className={styles.thread}>
                    {activeFromList ? (
                        <>
                            <div className={styles.threadHeader}>
                                <div className={styles.customerLine}>
                                    <span className={styles.avatar}>{getInitials(activeFromList.user?.name)}</span>
                                    <div>
                                        <h2>{activeFromList.subject}</h2>
                                        <p>{activeFromList.user?.name} - {activeFromList.user?.email}</p>
                                    </div>
                                </div>
                                <div className={styles.threadActions}>
                                    <button type="button" onClick={() => void loadConversation(activeFromList.id)}>
                                        <RefreshCw size={15} />
                                    </button>
                                    <button type="button" onClick={() => setIsProfileOpen(true)}>
                                        <PanelRightOpen size={15} />
                                        Customer
                                    </button>
                                    <button type="button" onClick={() => void updateConversation({ assignToMe: true })}>
                                        <UserCheck size={15} />
                                        Assign
                                    </button>
                                    <select
                                        value={activeFromList.status}
                                        onChange={event => void updateConversation({ status: event.target.value })}
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="WAITING_USER">Answered</option>
                                        <option value="RESOLVED">Resolved</option>
                                    </select>
                                    <select
                                        value={activeFromList.priority}
                                        onChange={event => void updateConversation({ priority: event.target.value })}
                                    >
                                        {PRIORITIES.map(priority => (
                                            <option key={priority} value={priority}>{priority}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.threadMetaBar}>
                                <span className={styles.statusBadge}>{getStatusLabel(activeFromList.status)}</span>
                                <span className={`${styles.segmentBadge} ${getSegmentClass(activeFromList.sourceSegment)}`}>
                                    {activeFromList.sourceSegmentLabel}
                                </span>
                                <span><ShieldCheck size={14} /> {activeFromList.assignedAdmin?.name || 'Unassigned'}</span>
                                <span><Clock3 size={14} /> {formatDateTime(activeFromList.lastMessageAt)}</span>
                            </div>

                            <div className={styles.messages}>
                                {isThreadLoading ? <div className={styles.loading}>Loading thread...</div> : null}
                                {messages.map(message => {
                                    const isAdmin = message.senderRole === 'ADMIN';

                                    return (
                                        <article key={message.id} className={`${styles.message} ${isAdmin ? styles.adminMessage : styles.userMessage}`}>
                                            <div className={styles.messageBubble}>
                                                <p>{message.content}</p>
                                            </div>
                                            <span>
                                                {isAdmin ? message.sender?.name || 'Admin' : activeFromList.user?.name || 'User'} - {formatDateTime(message.createdAt)}
                                            </span>
                                        </article>
                                    );
                                })}
                            </div>

                            <form className={styles.composer} onSubmit={sendReply}>
                                <textarea
                                    value={reply}
                                    onChange={event => setReply(event.target.value)}
                                    placeholder="Reply as admin..."
                                    rows={2}
                                    maxLength={4000}
                                />
                                <button type="submit" disabled={isSending || !reply.trim()}>
                                    {isSending ? <Clock3 size={18} /> : <Send size={18} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className={styles.emptyThread}>
                            <Inbox size={34} />
                            <h2>No conversation selected</h2>
                            <p>Choose a chat from the inbox to answer it.</p>
                        </div>
                    )}
                </main>

                {activeFromList ? (
                    <button
                        type="button"
                        className={styles.drawerTab}
                        onClick={() => setIsProfileOpen(true)}
                        aria-label="Open customer information"
                    >
                        <PanelRightOpen size={18} />
                        <span>Customer</span>
                    </button>
                ) : null}

                {isProfileOpen ? (
                    <button
                        type="button"
                        className={styles.drawerBackdrop}
                        onClick={() => setIsProfileOpen(false)}
                        aria-label="Close customer information"
                    />
                ) : null}

                <aside className={`${styles.profilePanel} ${isProfileOpen ? styles.profilePanelOpen : ''}`} aria-hidden={!isProfileOpen}>
                    {activeFromList ? (
                        <>
                            <div className={styles.profileHeader}>
                                <span className={styles.profileAvatar}>{getInitials(activeFromList.user?.name)}</span>
                                <div>
                                    <h3>{activeFromList.user?.name}</h3>
                                    <p>{activeFromList.user?.email}</p>
                                </div>
                                <button
                                    type="button"
                                    className={styles.drawerClose}
                                    onClick={() => setIsProfileOpen(false)}
                                    aria-label="Close customer information"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            <div className={styles.segmentStack}>
                                {(customerProfile?.segmentTagLabels || activeFromList.segmentTagLabels).map(tag => (
                                    <span key={tag.id} className={`${styles.segmentBadge} ${getSegmentClass(tag.id)}`}>
                                        {tag.label}
                                    </span>
                                ))}
                            </div>

                            <div className={styles.profileFacts}>
                                <span><ShieldCheck size={15} /> {activeFromList.user?.role || 'USER'}</span>
                                <span><Sparkles size={15} /> {activeFromList.user?.isPro ? 'Pro active' : 'No Pro subscription'}</span>
                                <span><ArrowUpRight size={15} /> {activeFromList.user?.genre || 'Genre not set'}</span>
                            </div>

                            <section className={styles.sideSection}>
                                <h4><Inbox size={15} /> Recent Submissions</h4>
                                {customerProfile?.latestSubmissions?.length ? (
                                    customerProfile.latestSubmissions.slice(0, 5).map(submission => (
                                        <div key={submission.id} className={styles.timelineRow}>
                                            <strong>{submission.planLabel || submission.serviceName}</strong>
                                            <span>{submission.kindLabel} - {submission.paymentStatus}</span>
                                            <em>{formatDateTime(submission.paymentCompletedAt || submission.createdAt)}</em>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.sideEmpty}>No service submissions yet.</p>
                                )}
                            </section>

                            <section className={styles.sideSection}>
                                <h4><WalletCards size={15} /> Recent Payments</h4>
                                {customerProfile?.latestPayments?.length ? (
                                    customerProfile.latestPayments.slice(0, 4).map(payment => (
                                        <div key={payment.id} className={styles.timelineRow}>
                                            <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
                                            <span>{payment.description || payment.serviceName || payment.type} - {payment.status}</span>
                                            <em>{formatDateTime(payment.completedAt || payment.createdAt)}</em>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.sideEmpty}>No payments found.</p>
                                )}
                            </section>
                        </>
                    ) : (
                        <div className={styles.emptyProfile}>Customer context appears here.</div>
                    )}
                </aside>
            </div>
        </motion.div>
    );
}
