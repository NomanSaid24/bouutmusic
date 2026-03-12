'use client';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, XCircle, Search } from 'lucide-react';

const SERVICES = [
    { id: 1, title: 'Pro Subscription (Annual)', price: '₹1,999/yr', type: 'Subscription', active: true },
    { id: 2, title: 'Pro Subscription (Monthly)', price: '₹199/mo', type: 'Subscription', active: true },
    { id: 3, title: 'Demo Review by Expert', price: '₹500', type: 'One-time', active: true },
    { id: 4, title: 'Playlist Placement Basic', price: '₹1,500', type: 'One-time', active: true },
    { id: 5, title: 'Advanced Social PR Campaign', price: '₹5,000', type: 'One-time', active: false },
];

export default function AdminServicesPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Services & Pricing</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Manage subscriptions, promo tools, and their pricing</div>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={18} /> Add Service</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', background: '#f9fafb', borderRadius: '8px 8px 0 0' }}>
                    <div style={{ position: 'relative', width: 250 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                        <input type="text" className="input-field" placeholder="Search service..." style={{ paddingLeft: 36, height: 36, background: 'white' }} />
                    </div>
                </div>

                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Billing Type</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SERVICES.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 600, color: '#111827' }}>{s.title}</td>
                                    <td style={{ color: '#6b7280' }}>{s.type}</td>
                                    <td style={{ fontWeight: 600, color: '#059669' }}>{s.price}</td>
                                    <td>
                                        {s.active ? 
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 13, fontWeight: 500 }}><CheckCircle size={14} /> Active</span> :
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#9ca3af', fontSize: 13, fontWeight: 500 }}><XCircle size={14} /> Inactive</span>
                                        }
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-outline btn-sm" style={{ padding: '4px 12px', height: 'auto', fontSize: 12 }}>Edit Pricing</button>
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
