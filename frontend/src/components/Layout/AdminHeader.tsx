'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, LogOut, Settings, Shield, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNotifications } from '@/components/providers/NotificationProvider';

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BA';
}

function formatNotificationTime(value: string) {
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

export function AdminHeader() {
    const { user, isAuthenticated, openAuthModal, logout } = useAuth();
    const {
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
    } = useNotifications();
    const [accountOpen, setAccountOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            if (accountRef.current && !accountRef.current.contains(target)) {
                setAccountOpen(false);
            }

            if (notificationsRef.current && !notificationsRef.current.contains(target)) {
                setNotificationsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const accountLabel = user?.name.split(' ')[0] || 'Login';

    return (
        <header className="admin-topbar">
            <div className="admin-topbar-spacer" aria-hidden="true" />

            <div className="admin-topbar-actions">
                <div className="admin-header-popover" ref={notificationsRef}>
                    <button
                        type="button"
                        className="admin-header-icon-btn"
                        title="Notifications"
                        onClick={() => {
                            if (!isAuthenticated) {
                                openAuthModal('login', '/admin');
                                return;
                            }

                            setNotificationsOpen(current => !current);
                            setAccountOpen(false);
                        }}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="admin-header-icon-dot" />}
                    </button>

                    {notificationsOpen && (
                        <div className="admin-header-panel admin-notifications-panel">
                            <div className="admin-header-panel-title">Notifications</div>
                            {notifications.length ? (
                                <>
                                    <div className="admin-notification-list">
                                        {notifications.slice(0, 7).map(notification => (
                                            <Link
                                                key={notification.id}
                                                href={notification.link || '/admin/notifications'}
                                                className={`admin-notification-item ${notification.read ? '' : 'is-unread'}`}
                                                onClick={() => {
                                                    setNotificationsOpen(false);
                                                    void markNotificationRead(notification.id);
                                                }}
                                            >
                                                <strong>{notification.title}</strong>
                                                <span>{notification.message}</span>
                                                <em>{formatNotificationTime(notification.createdAt)}</em>
                                            </Link>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="admin-panel-action"
                                        onClick={() => void markAllNotificationsRead()}
                                    >
                                        Mark all as read
                                    </button>
                                </>
                            ) : (
                                <p className="admin-header-panel-copy">No new admin notifications yet.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="admin-header-popover" ref={accountRef}>
                    <button
                        type="button"
                        className="admin-profile-btn"
                        onClick={() => {
                            if (!isAuthenticated) {
                                openAuthModal('login', '/admin');
                                return;
                            }

                            setAccountOpen(current => !current);
                            setNotificationsOpen(false);
                        }}
                    >
                        <span className={`admin-profile-avatar ${isAuthenticated ? '' : 'is-guest'}`}>
                            {user ? getInitials(user.name) : <User size={16} />}
                        </span>
                        <span className="admin-profile-label">{accountLabel}</span>
                        <ChevronDown size={14} className={`admin-profile-chevron ${accountOpen ? 'is-open' : ''}`} />
                    </button>

                    {accountOpen && user && (
                        <div className="admin-header-panel admin-account-panel">
                            <div className="admin-account-summary">
                                <span className="admin-account-name">{user.name}</span>
                                <span className="admin-account-email">{user.email}</span>
                            </div>

                            <Link href="/admin" className="admin-account-entry" onClick={() => setAccountOpen(false)}>
                                <Shield size={14} />
                                <span>Admin Overview</span>
                            </Link>
                            <Link href="/dashboard/settings" className="admin-account-entry" onClick={() => setAccountOpen(false)}>
                                <Settings size={14} />
                                <span>Profile Settings</span>
                            </Link>
                            <Link href="/dashboard" className="admin-account-entry" onClick={() => setAccountOpen(false)}>
                                <User size={14} />
                                <span>Artist Dashboard</span>
                            </Link>

                            <button
                                type="button"
                                className="admin-account-entry admin-account-logout"
                                onClick={() => {
                                    setAccountOpen(false);
                                    logout();
                                }}
                            >
                                <LogOut size={14} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
