'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Crown, MessageCircle, Search, User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
}

export function Sidebar({ compact = false }: { compact?: boolean }) {
    const {
        user,
        isAuthenticated,
        isAdmin,
        openAuthModal,
        logout,
    } = useAuth();
    const [searchValue, setSearchValue] = useState('');
    const [showProfile, setShowProfile] = useState(false);

    return (
        <aside className={`app-sidebar ${compact ? 'app-sidebar-compact' : ''}`}>
            {/* Search Bar */}
            <div className="sb-search-wrapper">
                <Search size={14} className="sb-search-icon" />
                <input
                    type="text"
                    placeholder="Search artists, tracks..."
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    className="sb-search"
                />
            </div>

            <div className="sb-divider" />

            {/* User Profile Area */}
            <div className="sb-profile">
                {isAuthenticated && user ? (
                    <>
                        <div className="sb-avatar">
                            {getInitials(user.name)}
                        </div>
                        {!compact && <div className="sb-name">{user.name}</div>}

                        {/* Profile dropdown toggle */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="sb-profile-toggle"
                                onClick={() => setShowProfile(c => !c)}
                            >
                                <ChevronDown size={14} />
                            </button>
                            {showProfile && (
                                <div className="sb-profile-dropdown">
                                    <Link href="/dashboard" onClick={() => setShowProfile(false)} className="sb-profile-link">
                                        <User size={14} /> My Profile
                                    </Link>
                                    <Link href="/dashboard/settings" onClick={() => setShowProfile(false)} className="sb-profile-link">
                                        <Settings size={14} /> Settings
                                    </Link>
                                    {isAdmin && (
                                        <Link href="/admin" onClick={() => setShowProfile(false)} className="sb-profile-link">
                                            <Shield size={14} /> Admin
                                        </Link>
                                    )}
                                    <button
                                        className="sb-profile-link sb-profile-logout"
                                        onClick={() => { setShowProfile(false); logout(); }}
                                    >
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="sb-avatar sb-avatar-placeholder">
                            <User size={32} />
                        </div>
                        <div className="sb-auth-actions">
                            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => openAuthModal('login')}>
                                <User size={14} /> Sign in
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => openAuthModal('register')}>
                                Register
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom action icons */}
            <div className="sb-actions">
                {isAuthenticated && (
                    <>
                        <button className="sb-icon-btn" title="Messages">
                            <MessageCircle size={22} />
                        </button>
                        <button className="sb-icon-btn" title="Notifications">
                            <Bell size={22} />
                            <span className="sb-icon-dot" />
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}
