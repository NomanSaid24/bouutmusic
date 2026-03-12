import Link from 'next/link';
import { BarChart2, Music2, Globe, Megaphone, CheckCircle, AlertCircle } from 'lucide-react';

const THINGS_TO_DO = [
    { num: 1, text: 'Apply in publication opportunity', due: 'Due Apr 15' },
    { num: 2, text: 'Apply in radio play opportunity', due: 'Due Apr 30' },
    { num: 3, text: 'Complete your e-Press Kit', due: 'Profile 4% complete' },
    { num: 4, text: 'Upload your first song', due: 'Start distributing' },
];

const QUICK_ACTIONS = [
    { title: 'Distribute your music', href: '/dashboard/release', color: 'rgba(16,65,182,0.06)', icon: <Globe size={24} /> },
    { title: 'Participate in Opportunity', href: '/dashboard/opportunities', color: 'rgba(16,65,182,0.06)', icon: <CheckCircle size={24} /> },
    { title: 'Promote Your Music', href: '/dashboard/promo-tools', color: 'rgba(16,65,182,0.06)', icon: <Megaphone size={24} /> },
    { title: 'Broadcast Your Video', href: '/dashboard/broadcast', color: 'rgba(16,65,182,0.06)', icon: <BarChart2 size={24} /> },
];

export default function DashboardPage() {
    return (
        <div>
            <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> My Dashboard</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                {/* Left */}
                <div>
                    <h1 className="dashboard-welcome">Hi, <span>Noman!</span> 🤙</h1>

                    {/* Quick Actions */}
                    <div className="action-cards">
                        {QUICK_ACTIONS.map(a => (
                            <Link key={a.title} href={a.href} className="action-card" style={{ textDecoration: 'none' }}>
                                <div style={{ color: 'var(--primary)', marginBottom: 12 }}>{a.icon}</div>
                                <div className="action-card-title">{a.title}</div>
                            </Link>
                        ))}
                    </div>

                    {/* Things To Do */}
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

                    {/* My Stats */}
                    <div className="section">
                        <div className="section-title" style={{ marginBottom: 16 }}>My Stats</div>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            {[
                                { label: 'Total Plays', value: '0', icon: <Music2 size={20} /> },
                                { label: 'Total Songs', value: '0', icon: <Music2 size={20} /> },
                                { label: 'Followers', value: '0', icon: <Globe size={20} /> },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div style={{ color: 'var(--primary)', marginBottom: 8 }}>{s.icon}</div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — Profile */}
                <div>
                    <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
                        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#1041b6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, margin: '0 auto 12px' }}>NS</div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Noman Said</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>PROGRESS: <strong style={{ color: '#1041b6' }}>4%</strong></div>
                        <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6, margin: '10px 0 16px' }}>
                            <div style={{ width: '4%', height: '100%', background: '#1041b6', borderRadius: 4 }} />
                        </div>
                        <Link href="/dashboard/epk" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Update EPK</Link>
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
    );
}
