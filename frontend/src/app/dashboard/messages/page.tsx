'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Headphones,
    LifeBuoy,
    MessageCircle,
    Plus,
    Send,
    ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './SupportMessagesPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type SegmentLabel = {
    id: string;
    label: string;
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
    unreadForUser: number;
    assignedAdmin?: {
        id: string;
        name: string;
        avatar?: string | null;
    } | null;
};

type SupportMessage = {
    id: string;
    conversationId: string;
    content: string;
    senderRole: string;
    senderId: string;
    createdAt: string;
    sender?: {
        id: string;
        name: string;
        avatar?: string | null;
    } | null;
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

function getStatusLabel(status: string) {
    if (status === 'WAITING_USER') return 'Answered';
    if (status === 'RESOLVED') return 'Resolved';
    return 'Open';
}

export default function MessagesPage() {
    const { token, user, isLoading: isAuthLoading, openAuthModal } = useAuth();
    const [conversations, setConversations] = useState<SupportConversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [subject, setSubject] = useState('');
    const [firstMessage, setFirstMessage] = useState('');
    const [reply, setReply] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isThreadLoading, setIsThreadLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = useMemo(
        () => conversations.find(conversation => conversation.id === activeId) || null,
        [activeId, conversations],
    );

    const unreadCount = useMemo(
        () => conversations.reduce((total, conversation) => total + conversation.unreadForUser, 0),
        [conversations],
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, activeId]);

    const loadConversations = useCallback(async (options?: { silent?: boolean }) => {
        if (!token) {
            return;
        }

        if (!options?.silent) {
            setIsLoading(true);
        }
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/support/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const payload = await response.json().catch(() => null) as SupportConversation[] | { error?: string } | null;

            if (!response.ok || !Array.isArray(payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to load support chats.'));
            }

            setConversations(payload);
            setActiveId(current => current || payload[0]?.id || null);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unable to load support chats.');
        } finally {
            if (!options?.silent) {
                setIsLoading(false);
            }
        }
    }, [token]);

    const loadMessages = useCallback(async (conversationId: string, options?: { silent?: boolean }) => {
        if (!token) {
            return;
        }

        if (!options?.silent) {
            setIsThreadLoading(true);
        }

        try {
            const response = await fetch(`${API_URL}/api/support/conversations/${conversationId}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const payload = await response.json().catch(() => null) as {
                conversation: SupportConversation;
                messages: SupportMessage[];
            } | { error?: string } | null;

            if (!response.ok || !payload || !('messages' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to load messages.'));
            }

            setMessages(payload.messages);
            setConversations(current => current.map(conversation =>
                conversation.id === payload.conversation.id ? payload.conversation : conversation,
            ));
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unable to load messages.');
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
            openAuthModal('login', '/dashboard/messages');
            return;
        }

        void loadConversations();
    }, [isAuthLoading, loadConversations, openAuthModal, token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const interval = window.setInterval(() => {
            void loadConversations({ silent: true });
        }, 12000);

        return () => window.clearInterval(interval);
    }, [loadConversations, token]);

    useEffect(() => {
        if (!activeId || !token) {
            setMessages([]);
            return;
        }

        void loadMessages(activeId);

        const interval = window.setInterval(() => {
            void loadMessages(activeId, { silent: true });
        }, 8000);

        return () => window.clearInterval(interval);
    }, [activeId, loadMessages, token]);

    async function createConversation(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token || isSending) {
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/support/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    subject,
                    content: firstMessage,
                }),
            });
            const payload = await response.json().catch(() => null) as SupportConversation | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to create support chat.'));
            }

            setConversations(current => [payload, ...current.filter(conversation => conversation.id !== payload.id)]);
            setActiveId(payload.id);
            setSubject('');
            setFirstMessage('');
            await loadMessages(payload.id, { silent: true });
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : 'Unable to create support chat.');
        } finally {
            setIsSending(false);
        }
    }

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
            const response = await fetch(`${API_URL}/api/support/conversations/${activeId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content }),
            });
            const payload = await response.json().catch(() => null) as SupportMessage | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(getErrorMessage(payload, 'Unable to send message.'));
            }

            setMessages(current => [...current, payload]);
            setReply('');
            await loadConversations({ silent: true });
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : 'Unable to send message.');
        } finally {
            setIsSending(false);
        }
    }

    if (!token && !isAuthLoading) {
        return (
            <div className={styles.authGate}>
                <LifeBuoy size={26} />
                <h1>Support Chat</h1>
                <button type="button" onClick={() => openAuthModal('login', '/dashboard/messages')}>
                    Sign in to continue
                    <ArrowRight size={16} />
                </button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.page}>
            <section className={styles.header}>
                <div>
                    <span className={styles.kicker}>
                        <LifeBuoy size={16} />
                        Artist Support
                    </span>
                    <h1>Support Chat</h1>
                    <p>{user?.name || 'Your account'} can message Bouut admin from here.</p>
                </div>
                <div className={styles.headerStats}>
                    <span>
                        <ShieldCheck size={16} />
                        Account only
                    </span>
                    <span>
                        <MessageCircle size={16} />
                        {conversations.length} chats
                    </span>
                    <span>
                        <Clock3 size={16} />
                        {unreadCount} unread
                    </span>
                </div>
            </section>

            {error ? <div className={styles.error}>{error}</div> : null}

            <div className={styles.workspace}>
                <aside className={styles.inbox}>
                    <form className={styles.newChat} onSubmit={createConversation}>
                        <div className={styles.sectionHead}>
                            <span><Plus size={15} /> New Request</span>
                        </div>
                        <input
                            value={subject}
                            onChange={event => setSubject(event.target.value)}
                            placeholder="Subject"
                            maxLength={120}
                        />
                        <textarea
                            value={firstMessage}
                            onChange={event => setFirstMessage(event.target.value)}
                            placeholder="Type your message..."
                            rows={4}
                            required
                            maxLength={4000}
                        />
                        <button type="submit" disabled={isSending || !firstMessage.trim()}>
                            {isSending ? 'Sending...' : 'Start Chat'}
                            <Send size={15} />
                        </button>
                    </form>

                    <div className={styles.threadList}>
                        <div className={styles.sectionHead}>
                            <span><Headphones size={15} /> My Chats</span>
                        </div>

                        {isLoading ? (
                            <div className={styles.emptyList}>Loading chats...</div>
                        ) : conversations.length === 0 ? (
                            <div className={styles.emptyList}>No support chats yet.</div>
                        ) : conversations.map(conversation => (
                            <button
                                key={conversation.id}
                                type="button"
                                className={`${styles.threadButton} ${conversation.id === activeId ? styles.activeThread : ''}`}
                                onClick={() => setActiveId(conversation.id)}
                            >
                                <span className={styles.threadTopline}>
                                    <strong>{conversation.subject}</strong>
                                    {conversation.unreadForUser > 0 ? <em>{conversation.unreadForUser}</em> : null}
                                </span>
                                <span className={styles.threadPreview}>{conversation.lastMessagePreview || 'New conversation'}</span>
                                <span className={styles.threadMeta}>
                                    <span>{conversation.sourceSegmentLabel}</span>
                                    <span>{formatDateTime(conversation.lastMessageAt)}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className={styles.chatPanel}>
                    {activeConversation ? (
                        <>
                            <div className={styles.chatHeader}>
                                <div>
                                    <span className={styles.statusPill}>{getStatusLabel(activeConversation.status)}</span>
                                    <h2>{activeConversation.subject}</h2>
                                    <div className={styles.segmentRow}>
                                        {activeConversation.segmentTagLabels.map(tag => (
                                            <span key={tag.id}>{tag.label}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.adminBadge}>
                                    <span>{activeConversation.assignedAdmin?.name?.slice(0, 2).toUpperCase() || 'BM'}</span>
                                    <strong>{activeConversation.assignedAdmin?.name || 'Bouut Admin'}</strong>
                                </div>
                            </div>

                            <div className={styles.messages}>
                                {isThreadLoading ? <div className={styles.loading}>Loading messages...</div> : null}

                                {messages.map(message => {
                                    const isMine = message.senderId === user?.id;

                                    return (
                                        <article key={message.id} className={`${styles.message} ${isMine ? styles.mine : styles.theirs}`}>
                                            <div className={styles.messageBubble}>
                                                <p>{message.content}</p>
                                            </div>
                                            <span className={styles.messageMeta}>
                                                {isMine ? 'You' : message.sender?.name || 'Bouut Admin'} · {formatDateTime(message.createdAt)}
                                            </span>
                                        </article>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className={styles.composer} onSubmit={sendReply}>
                                <textarea
                                    value={reply}
                                    onChange={event => setReply(event.target.value)}
                                    placeholder="Reply to support..."
                                    rows={2}
                                    maxLength={4000}
                                />
                                <button type="submit" disabled={isSending || !reply.trim()}>
                                    {isSending ? <Clock3 size={18} /> : <Send size={18} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <CheckCircle2 size={34} />
                            <h2>No chat selected</h2>
                            <p>Start a new support request or choose a chat from your inbox.</p>
                        </div>
                    )}
                </main>
            </div>
        </motion.div>
    );
}
