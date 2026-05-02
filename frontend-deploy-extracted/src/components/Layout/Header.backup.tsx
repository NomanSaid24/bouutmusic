'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, LogOut, MessageCircle, Search, Settings, Shield, User, X } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
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
    const [showSearch, setShowSearch] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const profileLinks = useMemo(() => {
        if (!user) {
            return [];
        }

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
            <header className="app-header">
                <div />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {showSearch ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f4f6f9', borderRadius: 8, padding: '6px 12px', minWidth: 240 }}>
                            <Search size={15} style={{ color: '#6b7280' }} />
                            <input autoFocus placeholder="Search songs, artists..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                            <button onClick={() => setShowSearch(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}><X size={14} /></button>
                        </div>
                    ) : (
                        <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setShowSearch(true)}><Search size={18} /></button>
                    )}

                    {isAuthenticated && user ? (
                        <>
                            <button className="btn btn-ghost" style={{ padding: 8, position: 'relative' }}>
                                <MessageCircle size={18} />
                                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#e63946', borderRadius: '50%' }} />
                            </button>
                            <button className="btn btn-ghost" style={{ padding: 8, position: 'relative' }}>
                                <Bell size={18} />
                                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#e63946', borderRadius: '50%' }} />
                            </button>

                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowProfile(current => !current)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                                >
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                                        {getInitials(user.name)}
                                    </div>
                                    <ChevronDown size={14} style={{ color: '#6b7280' }} />
                                </button>

                                {showProfile && (
                                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, width: 220, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 300 }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280' }}>{user.email}</div>
                                        </div>
                                        {profileLinks.map(item => (
                                            <Link key={item.href} href={item.href} onClick={() => setShowProfile(false)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none' }}
                                                onMouseEnter={event => (event.currentTarget.style.background = '#f4f6f9')}
                                                onMouseLeave={event => (event.currentTarget.style.background = 'transparent')}>
                                                {item.icon}{item.label}
                                            </Link>
                                        ))}
                                        <div style={{ borderTop: '1px solid #e5e7eb' }}>
                                            <button
                                                onClick={() => {
                                                    setShowProfile(false);
                                                    logout();
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#e63946', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
                                            >
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-ghost" onClick={() => openAuthModal('login')}>
                                <User size={15} /> Sign in
                            </button>
                            <button className="btn btn-primary" onClick={() => openAuthModal('register')}>
                                Register
                            </button>
                        </>
                    )}
                </div>
            </header>

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
