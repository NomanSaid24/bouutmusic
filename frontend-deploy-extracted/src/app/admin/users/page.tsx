'use client';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Edit2, Ban, Mail } from 'lucide-react';

const MOCK_USERS = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: ['Aryan Kapoor', 'Priya Singh', 'DJ Maverick', 'Raza Khan', 'Zara Ahmed', 'Dev Sharma', 'Kavya Music', 'Nina K', 'The Local Train', 'Zeno'][i],
    email: `artist${i+1}@example.com`,
    role: i === 0 ? 'Admin' : 'Artist',
    plan: i % 3 === 0 ? 'Pro' : 'Free',
    status: i === 7 ? 'Suspended' : 'Active',
    joined: 'Jan 15, 2026'
}));

export default function AdminUsersPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Users Management</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Manage artist accounts, roles, and subscriptions</div>
                </div>
                <button className="btn btn-primary">Add New User</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {/* Toolbar */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 16, alignItems: 'center', background: '#f9fafb', borderRadius: '8px 8px 0 0' }}>
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                        <input type="text" className="input-field" placeholder="Search users by name or email..." style={{ paddingLeft: 36, height: 36, background: 'white' }} />
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white' }}><Filter size={14} /> Filter</button>
                </div>

                {/* Table */}
                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Plan</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_USERS.map(user => (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 600 }}>{user.name}</td>
                                    <td style={{ color: '#6b7280' }}>{user.email}</td>
                                    <td><span className={`badge badge-${user.role === 'Admin' ? 'blue' : 'gray'}`}>{user.role}</span></td>
                                    <td><span className={`badge badge-${user.plan === 'Pro' ? 'yellow' : 'gray'}`}>{user.plan}</span></td>
                                    <td><span className={`badge badge-${user.status === 'Active' ? 'green' : 'red'}`}>{user.status}</span></td>
                                    <td style={{ color: '#6b7280' }}>{user.joined}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} title="Send Email"><Mail size={16} color="#6b7280" /></button>
                                            <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} title="Edit User"><Edit2 size={16} color="#6b7280" /></button>
                                            <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} title={user.status === 'Active' ? 'Suspend' : 'Reactivate'}>
                                                <Ban size={16} color={user.status === 'Active' ? 'var(--primary)' : '#10b981'} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#6b7280' }}>
                    <div>Showing 1 to 10 of 12,450 users</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-outline btn-sm" disabled>Previous</button>
                        <button className="btn btn-outline btn-sm">Next</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
