'use client';
import { motion } from 'framer-motion';
import { Download, Search, TrendingUp, Link as LinkIcon } from 'lucide-react';

const PAYMENTS = [
    { id: 'TXN-98237', user: 'DJ Maverick', type: 'Pro Subscription', amount: '₹1,999', date: 'Mar 10, 2026', method: 'UPI', status: 'Success' },
    { id: 'TXN-98236', user: 'Local Train', type: 'Demo Review', amount: '₹500', date: 'Mar 10, 2026', method: 'Credit Card', status: 'Success' },
    { id: 'TXN-98235', user: 'Zara Ahmed', type: 'Playlist Campaign', amount: '₹1,500', date: 'Mar 09, 2026', method: 'Net Banking', status: 'Failed' },
    { id: 'TXN-98234', user: 'Raza Khan', type: 'Pro Subscription', amount: '₹199', date: 'Mar 09, 2026', method: 'Credit Card', status: 'Success' },
    { id: 'TXN-98233', user: 'Neon Dreams', type: 'Playlist Campaign', amount: '₹1,500', date: 'Mar 08, 2026', method: 'UPI', status: 'Success' },
];

export default function AdminPaymentsPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Payments Overview</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Monitor all incoming transactions and revenue</div>
                </div>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Download size={18} /> Export Report</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
                <div className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>REVENUE (THIS MONTH)</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>₹325,450</div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>SUCCESS RATE</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>98.2%</div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>LAST PAYOUT BATCH</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>₹84,200 <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>to Artists</span></div>
                    <div style={{ fontSize: 13, color: '#10b981' }}>Processed on Mar 01, 2026</div>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: '8px 8px 0 0' }}>
                    <div className="tabs" style={{ marginBottom: 0 }}>
                        <button className="tab active" style={{ padding: '6px 16px', fontSize: 13 }}>All Transactions</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>Subscriptions</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>Services</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>Artist Payouts</button>
                    </div>
                    <div style={{ position: 'relative', width: 250 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                        <input type="text" className="input-field" placeholder="Search Trxn ID or User..." style={{ paddingLeft: 36, height: 36, background: 'white' }} />
                    </div>
                </div>

                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>User</th>
                                <th>Purchase Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Method</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PAYMENTS.map(tx => (
                                <tr key={tx.id}>
                                    <td style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: 13 }}>{tx.id}</td>
                                    <td style={{ fontWeight: 600 }}>{tx.user}</td>
                                    <td>{tx.type}</td>
                                    <td style={{ fontWeight: 600, color: '#111827' }}>{tx.amount}</td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>{tx.date}</td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>{tx.method}</td>
                                    <td><span className={`badge badge-${tx.status === 'Success' ? 'green' : 'red'}`}>{tx.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
