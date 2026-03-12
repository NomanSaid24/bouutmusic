'use client';
import { motion } from 'framer-motion';
import { Download, IndianRupee, TrendingUp, Calendar } from 'lucide-react';

export default function FinancePage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">Finance & Royalties</h1>
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>Track your streaming revenue, statements, and royalty splits.</div>
                </div>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Download size={18} /> Export CSV</button>
            </div>

            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <IndianRupee size={16} /> TOTAL EARNINGS
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>₹45,250.00</div>
                    <div style={{ fontSize: 13, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}><TrendingUp size={14} /> +12% this month</div>
                </div>
                
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: 4, borderRadius: 4 }}><IndianRupee size={12} /></div> WITHDRAWABLE BALANCE
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>₹12,400.00</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Withdraw Funds</button>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Calendar size={16} /> NEXT PAYOUT
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>15 Apr</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>Minimum threshold: ₹500</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 24 }}>
                <button className="tab active">Statements</button>
                <button className="tab">Royalty Splits</button>
                <button className="tab">Payment Methods</button>
            </div>

            {/* Statements Table */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Total Streams</th>
                            <th>Revenue</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { period: 'Feb 2026', streams: '124,500', rev: '₹8,200', status: 'Pending' },
                            { period: 'Jan 2026', streams: '112,000', rev: '₹7,500', status: 'Paid' },
                            { period: 'Dec 2025', streams: '98,000', rev: '₹6,400', status: 'Paid' },
                        ].map((s, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{s.period}</td>
                                <td>{s.streams}</td>
                                <td>{s.rev}</td>
                                <td><span className={`badge badge-${s.status === 'Paid' ? 'green' : 'yellow'}`}>{s.status}</span></td>
                                <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>Download PDF</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
