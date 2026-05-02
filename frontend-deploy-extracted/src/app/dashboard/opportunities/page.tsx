'use client';
import Link from 'next/link';
import { useState } from 'react';

const OPPS = [
    { id: '1', title: 'Radio Airplay — Mirchi 98.3', type: 'radio', deadline: 'Apr 30, 2026', reward: '₹5,000 + airplay', active: true },
    { id: '2', title: 'Spotify Playlist Feature', type: 'publication', deadline: 'Apr 15, 2026', reward: 'Playlist placement', active: true },
    { id: '3', title: 'Live Gig — Mumbai Music Fest', type: 'gig', deadline: 'May 10, 2026', reward: '₹20,000 + exposure', active: true },
    { id: '4', title: 'Songwriting Contest 2026', type: 'contest', deadline: 'Jun 1, 2026', reward: 'Studio session worth ₹50,000', active: true },
    { id: '5', title: 'MTV Campus Rocks', type: 'gig', deadline: 'Apr 20, 2026', reward: 'Tour + ₹30,000', active: true },
    { id: '6', title: 'Rolling Stone India Feature', type: 'publication', deadline: 'Mar 31, 2026', reward: 'Magazine feature', active: false },
];

const TYPE_COLORS: Record<string, string> = { radio: 'badge-blue', publication: 'badge-green', gig: 'badge-yellow', contest: 'badge-red' };

export default function OpportunitiesPage() {
    const [tab, setTab] = useState<'active' | 'closed'>('active');
    const filtered = OPPS.filter(o => tab === 'active' ? o.active : !o.active);

    return (
        <div>
            <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span> Opportunities</div>
            <div className="page-header"><h1 className="page-title">Opportunities</h1></div>
            <div className="tabs">
                <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active</button>
                <button className={`tab ${tab === 'closed' ? 'active' : ''}`} onClick={() => setTab('closed')}>Closed</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map(opp => (
                    <div key={opp.id} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{opp.title}</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className={`badge ${TYPE_COLORS[opp.type]}`}>{opp.type}</span>
                                <span style={{ fontSize: 12, color: '#6b7280' }}>Deadline: {opp.deadline}</span>
                                <span style={{ fontSize: 12, color: '#6b7280' }}>Reward: {opp.reward}</span>
                            </div>
                        </div>
                        {opp.active && <button className="btn btn-primary btn-sm">Apply Now</button>}
                    </div>
                ))}
            </div>
        </div>
    );
}
