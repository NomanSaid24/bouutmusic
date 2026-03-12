'use client';
import { motion } from 'framer-motion';
import { Users, Music, Activity, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Admin Overview</h1>
                <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Platform statistics and recent activity</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
                {/* Stat Cards */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>TOTAL USERS</div>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>12,450</div>
                    <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}><TrendingUp size={14} /> +120 this week</div>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>SONGS UPLOADED</div>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Music size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>45,210</div>
                    <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}><TrendingUp size={14} /> +450 this week</div>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>PRO SUBSCRIBERS</div>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fefce8', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>3,240</div>
                    <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}><TrendingUp size={14} /> +32 this week</div>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>REVENUE (MTH)</div>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>₹8.4M</div>
                    <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}><TrendingUp size={14} /> +5% vs last month</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Recent Registrations */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700 }}>New Artists</h2>
                        <button className="btn btn-ghost btn-sm">View All</button>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Artist</th><th>Genre</th><th>Joined</th><th>Plan</th></tr></thead>
                            <tbody>
                                {[
                                    { name: 'Kavya Music', genre: 'Indie Pop', date: 'Today, 10:20 AM', plan: 'Free' },
                                    { name: 'DJ Zeno', genre: 'EDM', date: 'Today, 09:15 AM', plan: 'Pro' },
                                    { name: 'The Local Train', genre: 'Rock', date: 'Yesterday', plan: 'Pro' },
                                    { name: 'Neha V', genre: 'Acoustic', date: 'Yesterday', plan: 'Free' },
                                ].map((u, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ color: '#6b7280' }}>{u.genre}</td>
                                        <td style={{ color: '#6b7280' }}>{u.date}</td>
                                        <td><span className={`badge badge-${u.plan === 'Pro' ? 'yellow' : 'gray'}`}>{u.plan}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Pending Approvals</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, border: '1px solid #f3f4f6', borderRadius: 8 }}>
                            <div style={{ width: 40, height: 40, background: '#fef2f2', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music size={18} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>12 Songs</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>Awaiting distribution approval</div>
                            </div>
                            <button className="btn btn-outline btn-sm">Review</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, border: '1px solid #f3f4f6', borderRadius: 8 }}>
                            <div style={{ width: 40, height: 40, background: '#eff6ff', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldAlert size={18} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>5 Reports</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>Copyright claims</div>
                            </div>
                            <button className="btn btn-outline btn-sm">Review</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, border: '1px solid #f3f4f6', borderRadius: 8 }}>
                            <div style={{ width: 40, height: 40, background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileVideo size={18} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>3 TV Submissions</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>Bouut TV broadcasting review</div>
                            </div>
                            <button className="btn btn-outline btn-sm">Review</button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Missing Lucide Icons
import { ShieldAlert, FileVideo, Award } from 'lucide-react';
