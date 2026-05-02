'use client';

import { FormEvent, useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, MessageCircle, Settings, Shield, User, X } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { Sidebar } from './Sidebar';

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
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

interface DropdownItem {
    label: string;
    href: string;
}

interface NavEntry {
    label: string;
    href?: string;
    requiresAuth?: boolean;
    authMode?: 'login' | 'register';
    children?: DropdownItem[];
}

const leftNav: NavEntry[] = [
    { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
    { label: 'E-Profile', href: '/dashboard/epk', requiresAuth: true },
    {
        label: 'Release',
        requiresAuth: true,
        children: [
            { label: 'Create Release', href: '/dashboard/release' },
            { label: 'My Releases', href: '/dashboard/release/my-releases' },
        ],
    },
    { label: 'Analytics', href: '/dashboard/analytics', requiresAuth: true },
];

const rightNavAuth: NavEntry[] = [
    {
        label: 'Finance',
        requiresAuth: true,
        children: [
            { label: 'Revenue Report', href: '/dashboard/finance' },
            { label: 'Royalty Splits', href: '/dashboard/finance' },
        ],
    },
    { label: 'Promo Tools', href: '/dashboard/promo-tools', requiresAuth: false },
    {
        label: 'Discover',
        children: [
            { label: 'Blogs', href: '/blogs' },
            { label: 'Playlists', href: '/playlists' },
            { label: 'Roaster', href: '/roaster' },
        ],
    },
];

const rightNavGuest: NavEntry[] = [
    {
        label: 'Finance',
        requiresAuth: true,
        children: [
            { label: 'Revenue Report', href: '/dashboard/finance' },
            { label: 'Royalty Splits', href: '/dashboard/finance' },
        ],
    },
    { label: 'Promo Tools', href: '/dashboard/promo-tools', requiresAuth: false },
    {
        label: 'Discover',
        children: [
            { label: 'Blogs', href: '/blogs' },
            { label: 'Playlists', href: '/playlists' },
            { label: 'Roaster', href: '/roaster' },
        ],
    },
];

function NavDropdown({ entry }: { entry: NavEntry }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { isAuthenticated, openAuthModal } = useAuth();

    const isChildActive = entry.children?.some(c => pathname === c.href) ?? false;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="header-nav-dropdown" ref={ref}>
            <button
                className={`menu-item ${isChildActive ? 'is-active' : ''}`}
                onClick={() => setOpen(o => !o)}
            >
                {entry.label}
                <span className="menu-chev" />
            </button>
            {open && (
                <div className="header-dropdown-menu">
                    {entry.children!.map(child => (
                        <Link
                            key={child.href + child.label}
                            href={child.href}
                            className={`header-dropdown-item ${pathname === child.href ? 'active' : ''}`}
                            onClick={(e) => {
                                if (entry.requiresAuth && !isAuthenticated) {
                                    e.preventDefault();
                                    openAuthModal(entry.authMode || 'login', child.href);
                                }
                                setOpen(false);
                            }}
                        >
                            {child.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function NavLink({ entry }: { entry: NavEntry }) {
    const pathname = usePathname();
    const { isAuthenticated, openAuthModal } = useAuth();

    if (entry.children) {
        return <NavDropdown entry={entry} />;
    }

    const isActive = entry.href
        ? pathname === entry.href || (entry.href !== '/' && pathname.startsWith(entry.href + '/'))
        : false;

    return (
        <Link
            href={entry.href!}
            className={`menu-item ${isActive ? 'is-active' : ''}`}
            onClick={e => {
                if (entry.requiresAuth && !isAuthenticated) {
                    e.preventDefault();
                    openAuthModal(entry.authMode || 'login', entry.href);
                }
            }}
        >
            {entry.label}
        </Link>
    );
}

function MobileNavLink({ entry, onClose }: { entry: NavEntry; onClose: () => void }) {
    const pathname = usePathname();
    const { isAuthenticated, openAuthModal } = useAuth();
    const [expanded, setExpanded] = useState(false);

    if (entry.children) {
        const isChildActive = entry.children.some(c => pathname === c.href);
        return (
            <div>
                <button
                    className={`mobile-nav-item ${isChildActive ? 'is-active' : ''}`}
                    onClick={() => setExpanded(o => !o)}
                >
                    {entry.label}
                    <span className="menu-chev" />
                </button>
                {expanded && (
                    <div className="mobile-dropdown-children">
                        {entry.children.map(child => (
                            <Link
                                key={child.href + child.label}
                                href={child.href}
                                onClick={(e) => {
                                    if (entry.requiresAuth && !isAuthenticated) {
                                        e.preventDefault();
                                        openAuthModal(entry.authMode || 'login', child.href);
                                    }
                                    onClose();
                                }}
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const isActive = entry.href
        ? pathname === entry.href || (entry.href !== '/' && pathname.startsWith(entry.href + '/'))
        : false;

    return (
        <Link
            href={entry.href!}
            className={`mobile-nav-item ${isActive ? 'is-active' : ''}`}
            onClick={e => {
                if (entry.requiresAuth && !isAuthenticated) {
                    e.preventDefault();
                    openAuthModal(entry.authMode || 'login', entry.href);
                }
                onClose();
            }}
        >
            {entry.label}
        </Link>
    );
}

export function Header() {
    const router = useRouter();
    const {
        user,
        isAuthenticated,
        isAdmin,
        isAuthModalOpen,
        authMode,
        authError,
        isSubmitting,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
    } = useAuth();
    const {
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
    } = useNotifications();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const profileLinks = useMemo(() => {
        if (!user) return [];
        const links = [
            { label: 'My Profile', href: '/dashboard', icon: <User size={14} /> },
            { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={14} /> },
        ];
        if (isAdmin) {
            links.unshift({ label: 'Admin Dashboard', href: '/admin', icon: <Shield size={14} /> });
        }
        return links;
    }, [isAdmin, user]);

    const desktopNav = useMemo(
        () => [...leftNav, ...(isAuthenticated ? rightNavAuth : rightNavGuest)],
        [isAuthenticated]
    );

    const accountLabel = user?.name.split(' ')[0] || 'Login';

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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            if (authMode === 'login') {
                await login({ email, password });
                return;
            }
            await register({ name: fullName, email, password });
        } catch {
            // AuthProvider already exposes the user-facing error message.
        }
    }

    return (
        <>
            <header className="topbar">
                <div className="topbar-inner">
                    <button
                        className={`mobile-menu-btn ${mobileOpen ? 'is-open' : ''}`}
                        onClick={() => setMobileOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <Link href="/" className="brand" aria-label="Bouut Music Home">
                        <div className="brand-mark">
                            <img
                                src="/logo-light.png"
                                alt="Bouut Music"
                                className="brand-logo-img"
                            />
                        </div>
                    </Link>

                    <nav className="menu menu-main" aria-label="Primary navigation">
                        {desktopNav.map(entry => (
                            <NavLink key={entry.label} entry={entry} />
                        ))}
                    </nav>

                    <div className="topbar-right">
                        <div className="header-user-controls">
                            <button
                                type="button"
                                className="header-icon-btn"
                                title="Messages"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        openAuthModal('login', '/dashboard/messages');
                                        return;
                                    }
                                    router.push('/dashboard/messages');
                                }}
                            >
                                <MessageCircle size={18} />
                            </button>

                            <div className="header-popover" ref={notificationsRef}>
                                <button
                                    type="button"
                                    className="header-icon-btn"
                                    title="Notifications"
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            openAuthModal('login');
                                            return;
                                        }
                                        setNotificationsOpen(current => !current);
                                        setAccountOpen(false);
                                    }}
                                    >
                                        <Bell size={18} />
                                    {isAuthenticated && unreadCount > 0 && <span className="header-icon-dot" />}
                                    </button>

                                    {notificationsOpen && (
                                        <div className="header-floating-panel header-notifications-panel">
                                        <div className="header-panel-title">Notifications</div>
                                        {notifications.length ? (
                                            <>
                                                <div className="header-notification-list">
                                                    {notifications.slice(0, 6).map(notification => (
                                                        <Link
                                                            key={notification.id}
                                                            href={notification.link || '/dashboard/messages'}
                                                            className={`header-notification-item ${notification.read ? '' : 'is-unread'}`}
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
                                                    className="header-panel-action"
                                                    onClick={() => void markAllNotificationsRead()}
                                                >
                                                    Mark all as read
                                                </button>
                                            </>
                                        ) : (
                                            <p className="header-panel-copy">No new notifications yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="header-popover" ref={accountRef}>
                                <button
                                    type="button"
                                    className="header-profile-btn"
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            openAuthModal('login');
                                            return;
                                        }
                                        setAccountOpen(current => !current);
                                        setNotificationsOpen(false);
                                    }}
                                >
                                    <span className={`header-profile-avatar ${isAuthenticated ? '' : 'is-guest'}`}>
                                        {user ? getInitials(user.name) : <User size={16} />}
                                    </span>
                                    <span className="header-profile-label">{accountLabel}</span>
                                    <ChevronDown size={14} className={`header-profile-chevron ${accountOpen ? 'is-open' : ''}`} />
                                </button>

                                {accountOpen && user && (
                                    <div className="header-floating-panel header-account-panel">
                                        <div className="header-account-summary">
                                            <span className="header-account-name">{user.name}</span>
                                            <span className="header-account-email">{user.email}</span>
                                        </div>

                                        {profileLinks.map(link => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className="header-account-entry"
                                                onClick={() => setAccountOpen(false)}
                                            >
                                                {link.icon}
                                                <span>{link.label}</span>
                                            </Link>
                                        ))}

                                        <button
                                            type="button"
                                            className="header-account-entry header-account-logout"
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
                    </div>
                </div>
            </header>

            {/* Mobile drawer overlay */}
            <div
                className={`mobile-drawer-overlay ${mobileOpen ? 'is-open' : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Mobile drawer */}
            <div className={`mobile-drawer ${mobileOpen ? 'is-open' : ''}`}>
                <div className="mobile-drawer-nav">
                    <div className="mobile-drawer-col">
                        {leftNav.map(entry => (
                            <MobileNavLink key={entry.label} entry={entry} onClose={() => setMobileOpen(false)} />
                        ))}
                    </div>
                    <div className="mobile-drawer-col">
                        {(isAuthenticated ? rightNavAuth : rightNavGuest).map(entry => (
                            <MobileNavLink key={entry.label} entry={entry} onClose={() => setMobileOpen(false)} />
                        ))}
                    </div>
                </div>
                {/* Compact sidebar card in mobile drawer */}
                <div style={{ width: '100%', paddingTop: 16 }}>
                    <Sidebar compact />
                </div>
            </div>

            {/* Auth Modal — unchanged */}
            {isAuthModalOpen && (
                <div className="modal-overlay" onClick={event => event.target === event.currentTarget && closeAuthModal()}>
                    <div className="modal">
                        <button className="modal-close" onClick={closeAuthModal}><X size={20} /></button>

                        <div className="tabs" style={{ marginBottom: 20 }}>
                            <button className={`tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => openAuthModal('login')}>Login</button>
                            <button className={`tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => openAuthModal('register')}>Register</button>
                        </div>

                        <h2 className="modal-title">{authMode === 'login' ? 'Welcome back!' : 'Join Bouut Music'}</h2>
                        <p className="modal-subtitle">{authMode === 'login' ? 'Sign in to your artist account' : 'Create your account with email and start building your artist workspace.'}</p>

                        <div style={{ background: '#f4f6f9', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: '#4b5563', marginBottom: 18 }}>
                            Email authentication is live now. Social login buttons can be added later without affecting this flow.
                        </div>

                        <form onSubmit={handleSubmit}>
                            {authMode === 'register' && (
                                <div className="form-group">
                                    <label className="form-label">Full Name <span className="required">*</span></label>
                                    <input className="form-input" placeholder="Your artist name" value={fullName} onChange={event => setFullName(event.target.value)} required />
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Email <span className="required">*</span></label>
                                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password <span className="required">*</span></label>
                                <input className="form-input" type="password" placeholder="Enter your password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} required />
                            </div>

                            {authError && (
                                <div style={{ background: 'rgba(230, 57, 70, 0.08)', border: '1px solid rgba(230, 57, 70, 0.18)', color: '#b91c1c', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, marginBottom: 14 }}>
                                    {authError}
                                </div>
                            )}

                            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        {authMode === 'login' && (
                            <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#6b7280' }}>
                                Use your registered email and password to continue.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
