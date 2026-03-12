'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, MessageCircle, User, LogOut, Settings, ChevronDown, X } from 'lucide-react';

const MOCK_USER = { name: 'Noman Said', email: 'noman.said@bouutmusic.com', avatar: null };

export function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

    return (
        <>
            <header className="app-header">
                {/* Left — spacer */}
                <div />

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Search */}
                    {showSearch ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f4f6f9', borderRadius: 8, padding: '6px 12px', minWidth: 240 }}>
                            <Search size={15} style={{ color: '#6b7280' }} />
                            <input autoFocus placeholder="Search songs, artists..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                            <button onClick={() => setShowSearch(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}><X size={14} /></button>
                        </div>
                    ) : (
                        <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setShowSearch(true)}><Search size={18} /></button>
                    )}

                    {isLoggedIn ? (
                        <>
                            <button className="btn btn-ghost" style={{ padding: 8, position: 'relative' }}>
                                <MessageCircle size={18} />
                                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#e63946', borderRadius: '50%' }} />
                            </button>
                            <button className="btn btn-ghost" style={{ padding: 8, position: 'relative' }}>
                                <Bell size={18} />
                                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#e63946', borderRadius: '50%' }} />
                            </button>

                            {/* Profile dropdown */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                                >
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                                        {MOCK_USER.name[0]}
                                    </div>
                                    <ChevronDown size={14} style={{ color: '#6b7280' }} />
                                </button>

                                {showProfile && (
                                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, width: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 300 }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{MOCK_USER.name}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280' }}>{MOCK_USER.email}</div>
                                        </div>
                                        {[
                                            { label: 'My Profile', href: '/dashboard', icon: <User size={14} /> },
                                            { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={14} /> },
                                        ].map(item => (
                                            <Link key={item.href} href={item.href} onClick={() => setShowProfile(false)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = '#f4f6f9')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                {item.icon}{item.label}
                                            </Link>
                                        ))}
                                        <div style={{ borderTop: '1px solid #e5e7eb' }}>
                                            <button onClick={() => { setIsLoggedIn(false); setShowProfile(false); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#e63946', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-ghost" onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}>
                                <User size={15} /> Sign in
                            </button>
                            <button className="btn btn-primary" onClick={() => { setAuthTab('register'); setShowAuthModal(true); }}>
                                Register
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAuthModal(false)}>
                    <div className="modal">
                        <button className="modal-close" onClick={() => setShowAuthModal(false)}><X size={20} /></button>

                        {/* Tabs */}
                        <div className="tabs" style={{ marginBottom: 20 }}>
                            <button className={`tab ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>Login</button>
                            <button className={`tab ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>Register</button>
                        </div>

                        <h2 className="modal-title">{authTab === 'login' ? 'Welcome back!' : 'Join Bouut Music'}</h2>
                        <p className="modal-subtitle">{authTab === 'login' ? 'Sign in to your artist account' : 'Start your music journey today'}</p>

                        {/* Social login */}
                        <button className="social-btn">
                            <img src="https://www.google.com/favicon.ico" width={16} height={16} alt="Google" />
                            Continue with Google
                        </button>
                        <button className="social-btn" style={{ background: '#1877f2', color: 'white', border: 'none' }}>
                            <span style={{ fontWeight: 800, fontSize: 16 }}>f</span>
                            Continue with Facebook
                        </button>

                        <div className="divider">or</div>

                        {/* Form */}
                        {authTab === 'register' && (
                            <div className="form-group">
                                <label className="form-label">Full Name <span className="required">*</span></label>
                                <input className="form-input" placeholder="Your artist name" />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Email <span className="required">*</span></label>
                            <input className="form-input" type="email" placeholder="you@example.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password <span className="required">*</span></label>
                            <input className="form-input" type="password" placeholder="••••••••" />
                        </div>

                        <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => { setIsLoggedIn(true); setShowAuthModal(false); }}>
                            {authTab === 'login' ? 'Sign In' : 'Create Account'}
                        </button>

                        {authTab === 'login' && (
                            <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#6b7280' }}>
                                <a href="#" style={{ color: 'var(--primary)' }}>Forgot your password?</a>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
