'use client';
import { motion } from 'framer-motion';
import { Search, Plus, Calendar, Radio, Globe, Tv, MoreVertical } from 'lucide-react';

const OPPS = [
    { id: 1, title: '9XM Indie Feature', type: 'TV Broadcast', status: 'Active', deadline: 'Mar 30, 2026', applicants: 145, icon: <Tv size={18} /> },
    { id: 2, title: 'Rolling Stone India - New Find', type: 'Publication', status: 'Active', deadline: 'Apr 05, 2026', applicants: 320, icon: <Globe size={18} /> },
    { id: 3, title: 'Radio City Freedom Play', type: 'Radio', status: 'Active', deadline: 'Mar 25, 2026', applicants: 89, icon: <Radio size={18} /> },
    { id: 4, title: 'NH7 Weekender Spotlight', type: 'Live Gig', status: 'Closed', deadline: 'Feb 20, 2026', applicants: 540, icon: <Globe size={18} /> },
];

export default function AdminOppPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Opportunities Management</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Create and manage gigs, TV features, and publications</div>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={18} /> New Opportunity</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>ACTIVE OPPS</div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>12</div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>TOTAL APPLICANTS</div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>1,485</div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>SELECTED ARTISTS</div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>24</div>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: '8px 8px 0 0' }}>
                    <div className="tabs" style={{ marginBottom: 0 }}>
                        <button className="tab active" style={{ padding: '6px 16px', fontSize: 13 }}>All Opportunities</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>Active</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>Closed</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>Drafts</button>
                    </div>
                    <div style={{ position: 'relative', width: 250 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                        <input type="text" className="input-field" placeholder="Search title..." style={{ paddingLeft: 36, height: 36, background: 'white' }} />
                    </div>
                </div>

                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Opportunity Title</th>
                                <th>Category</th>
                                <th>Deadline</th>
                                <th>Applicants</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {OPPS.map(op => (
                                <tr key={op.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#111827' }}>{op.title}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563', fontSize: 13 }}>
                                            {op.icon} {op.type}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13 }}>
                                            <Calendar size={14} /> {op.deadline}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{op.applicants}</td>
                                    <td><span className={`badge badge-${op.status === 'Active' ? 'green' : 'gray'}`}>{op.status}</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-outline btn-sm" style={{ marginRight: 8, fontSize: 12, padding: '4px 10px', height: 'auto' }}>View Applicants</button>
                                        <button className="btn btn-ghost btn-sm" style={{ padding: 4 }}><MoreVertical size={16} color="#6b7280" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
