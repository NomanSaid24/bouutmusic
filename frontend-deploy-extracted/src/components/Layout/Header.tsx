'use client';

import { FormEvent, ReactNode, useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, LogOut, MessageCircle, Settings, Shield, User, X } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
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

interface ProfileMenuLink {
    label: string;
    href: string;
    icon: ReactNode;
}

const leftNav: NavEntry[] = [
    { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
    { label: 'E-Press Kit', href: '/dashboard/epk', requiresAuth: true },
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
            { label: 'Playlists', href: '/playlists' },
            { label: 'Artists', href: '/artists' },
            { label: 'Blogs', href: '/blogs' },
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
            { label: 'Playlists', href: '/playlists' },
            { label: 'Artists', href: '/artists' },
            { label: 'Blogs', href: '/blogs' },
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
                onClick={() => {
                    if (entry.requiresAuth && !isAuthenticated) {
                        openAuthModal(entry.authMode || 'login', entry.children?.[0]?.href);
                        return;
                    }

                    setOpen(o => !o);
                }}
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
                    onClick={() => {
                        if (entry.requiresAuth && !isAuthenticated) {
                            openAuthModal(entry.authMode || 'login', entry.children?.[0]?.href);
                            onClose();
                            return;
                        }

                        setExpanded(o => !o);
                    }}
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

function HeaderAccountControls({
    user,
    isAuthenticated,
    profileLinks,
    openAuthModal,
    logout,
}: {
    user: { name: string; email: string } | null;
    isAuthenticated: boolean;
    profileLinks: ProfileMenuLink[];
    openAuthModal: (mode?: 'login' | 'register', redirectTo?: string) => void;
    logout: () => void;
}) {
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
    const accountInitials = user ? getInitials(user.name) : null;

    return (
        <div className="header-user-controls">
            <Link
                href="/dashboard/messages"
                className="header-icon-btn"
                title="Messages"
                onClick={(event) => {
                    if (!isAuthenticated) {
                        event.preventDefault();
                        openAuthModal('login', '/dashboard/messages');
                    }
                }}
            >
                <MessageCircle size={18} />
            </Link>

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
                    <span className="header-icon-dot" />
                </button>

                {notificationsOpen && (
                    <div className="header-floating-panel header-notifications-panel">
                        <div className="header-panel-title">Notifications</div>
                        <p className="header-panel-copy">No new notifications yet.</p>
                    </div>
                )}
            </div>

            <div className="header-popover" ref={accountRef}>
                <button
                    type="button"
                    className="header-profile-btn"
                    onClick={() => {
                        setAccountOpen(current => !current);
                        setNotificationsOpen(false);
                    }}
                >
                    <span className={`header-profile-avatar ${isAuthenticated ? '' : 'is-guest'}`}>
                        {accountInitials || <User size={16} />}
                    </span>
                    <span className="header-profile-label">{accountLabel}</span>
                    <ChevronDown size={14} className={`header-profile-chevron ${accountOpen ? 'is-open' : ''}`} />
                </button>

                {accountOpen && (
                    <div className="header-floating-panel header-account-panel">
                        {isAuthenticated && user ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <div className="header-account-summary">
                                    <span className="header-account-name">Welcome to Bouut Music</span>
                                    <span className="header-account-email">Sign in to access your dashboard, messages, and updates.</span>
                                </div>

                                <button
                                    type="button"
                                    className="header-account-entry"
                                    onClick={() => {
                                        setAccountOpen(false);
                                        openAuthModal('login');
                                    }}
                                >
                                    <User size={14} />
                                    <span>Login</span>
                                </button>

                                <button
                                    type="button"
                                    className="header-account-entry"
                                    onClick={() => {
                                        setAccountOpen(false);
                                        openAuthModal('register');
                                    }}
                                >
                                    <Shield size={14} />
                                    <span>Register</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export function Header() {
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
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);

    const profileLinks = useMemo<ProfileMenuLink[]>(() => {
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
                    {/* Mobile hamburger */}
                    <button
                        className={`mobile-menu-btn ${mobileOpen ? 'is-open' : ''}`}
                        onClick={() => setMobileOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    {/* Left brand */}
                    <Link href="/" className="brand" aria-label="Bouut Music Home">
                        <div className="brand-mark">
                            <img
                                src="/logo-light.png"
                                alt="Bouut Music"
                                className="brand-logo-img"
                            />
                        </div>
                    </Link>

                    {/* Center navigation */}
                    <nav className="menu menu-main">
                        {[...leftNav, ...(isAuthenticated ? rightNavAuth : rightNavGuest)].map(entry => (
                            <NavLink key={entry.label} entry={entry} />
                        ))}
                    </nav>

                    {/* Right account controls */}
                    <div className="topbar-right">
                        <HeaderAccountControls
                            user={user ? { name: user.name, email: user.email } : null}
                            isAuthenticated={isAuthenticated}
                            profileLinks={profileLinks}
                            openAuthModal={openAuthModal}
                            logout={logout}
                        />
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

                        <div className="auth-modal-note">
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
                                <div className="auth-modal-error">
                                    {authError}
                                </div>
                            )}

                            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        {authMode === 'login' && (
                            <p className="auth-modal-footnote">
                                Use your registered email and password to continue.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
