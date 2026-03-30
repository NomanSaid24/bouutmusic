'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    BarChart2,
    CheckCircle,
    Globe,
    Megaphone,
    Music2,
    UserRoundPen,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { OnboardingWizard } from '@/components/Dashboard/OnboardingWizard';
import { formatArtistLocation, getPrimaryArtistType } from '@/lib/profile';

const THINGS_TO_DO = [
    { num: 1, text: 'Apply in publication opportunity', due: 'Due Apr 15' },
    { num: 2, text: 'Apply in radio play opportunity', due: 'Due Apr 30' },
    { num: 3, text: 'Complete your e-Press Kit', due: 'Keep your profile fresh' },
    { num: 4, text: 'Upload your first song', due: 'Start distributing' },
];

const QUICK_ACTIONS = [
    { title: 'Distribute your music', href: '/dashboard/release', icon: <Globe size={24} /> },
    { title: 'Participate in Opportunity', href: '/dashboard/opportunities', icon: <CheckCircle size={24} /> },
    { title: 'Promote Your Music', href: '/dashboard/promo-tools', icon: <Megaphone size={24} /> },
    { title: 'Broadcast Your Video', href: '/dashboard/broadcast', icon: <BarChart2 size={24} /> },
];

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
}

export default function DashboardPage() {
    const { user, token, refreshUser } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);

    const locationLabel = useMemo(() => formatArtistLocation({
        country: user?.country,
        state: user?.state,
        city: user?.city,
    }), [user?.city, user?.country, user?.state]);
    const primaryArtistType = useMemo(() => getPrimaryArtistType(user?.artistTypes || []), [user?.artistTypes]);

    useEffect(() => {
        if (!user || !token) {
            return;
        }

        const shouldShowOnboarding = !user.onboardingCompleted
            && !(user.artistTypes?.length)
            && !user.country
            && !user.state
            && !user.city;

        setShowOnboarding(shouldShowOnboarding);
    }, [token, user]);

    if (!user) {
        return null;
    }

    return (
        <>
            <div>
                <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> My Dashboard</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24 }}>
                    <div>
                        <h1 className="dashboard-welcome">Hi, <span>{user.name.split(' ')[0]}!</span></h1>

                        <div className="action-cards">
                            {QUICK_ACTIONS.map(action => (
                                <Link key={action.title} href={action.href} className="action-card" style={{ textDecoration: 'none' }}>
                                    <div style={{ color: 'var(--primary)', marginBottom: 12 }}>{action.icon}</div>
                                    <div className="action-card-title">{action.title}</div>
                                </Link>
                            ))}
                        </div>

                        <div className="section">
                            <div className="section-title" style={{ marginBottom: 16 }}>Things To Do Today</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {THINGS_TO_DO.map(item => (
                                    <div key={item.num} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{item.num}</div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 500 }}>{item.text}</div>
                                            <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>{item.due}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="section">
                            <div className="section-title" style={{ marginBottom: 16 }}>My Stats</div>
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                {[
                                    { label: 'Total Plays', value: '0', icon: <Music2 size={20} /> },
                                    { label: 'Total Songs', value: '0', icon: <Music2 size={20} /> },
                                    { label: 'Followers', value: '0', icon: <Globe size={20} /> },
                                ].map(stat => (
                                    <div key={stat.label} className="stat-card">
                                        <div style={{ color: 'var(--primary)', marginBottom: 8 }}>{stat.icon}</div>
                                        <div className="stat-value">{stat.value}</div>
                                        <div className="stat-label">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="card dashboard-profile-card" style={{ padding: 24, marginBottom: 16 }}>
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    style={{ width: 92, height: 92, borderRadius: '50%', objectFit: 'cover', border: '4px solid #edf2ff', margin: '0 auto 14px', display: 'block' }}
                                />
                            ) : (
                                <div style={{ width: 92, height: 92, borderRadius: '50%', background: '#1041b6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, margin: '0 auto 12px' }}>
                                    {getInitials(user.name)}
                                </div>
                            )}
                            <div style={{ fontWeight: 700, fontSize: 16, textAlign: 'center' }}>{user.name}</div>
                            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 6 }}>
                                {primaryArtistType}
                            </div>
                            {locationLabel && (
                                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12.5, marginTop: 4 }}>
                                    {locationLabel}
                                </div>
                            )}
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10, textAlign: 'center' }}>
                                PROGRESS: <strong style={{ color: '#1041b6' }}>{user.profileProgress}%</strong>
                            </div>
                            <div style={{ background: '#e5e7eb', borderRadius: 999, height: 6, margin: '10px 0 18px' }}>
                                <div style={{ width: `${Math.min(user.profileProgress, 100)}%`, height: '100%', background: '#1041b6', borderRadius: 999 }} />
                            </div>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <Link href="/dashboard/epk" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                                    <UserRoundPen size={16} /> Update EPK
                                </Link>
                                {user.slug && (
                                    <Link href={`/${user.slug}`} className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>
                                        View Public EPK
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="card" style={{ padding: 20 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <AlertCircle size={14} style={{ color: '#d4af37' }} /> Get Latest Updates
                            </div>
                            <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.6 }}>
                                Stay informed about new opportunities, industry news, and platform updates. Check our blog regularly.
                            </div>
                            <Link href="/blogs" className="btn btn-outline btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>Read Blog</Link>
                        </div>
                    </div>
                </div>
            </div>

            {token && (
                <OnboardingWizard
                    isOpen={showOnboarding}
                    token={token}
                    initialArtistTypes={user.artistTypes}
                    initialCountry={user.country}
                    initialState={user.state}
                    initialCity={user.city}
                    onClose={() => setShowOnboarding(false)}
                    onComplete={async () => {
                        await refreshUser();
                    }}
                />
            )}
        </>
    );
}

