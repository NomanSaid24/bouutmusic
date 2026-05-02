'use client';
import { motion } from 'framer-motion';
import { Send, Users, User, Bell } from 'lucide-react';

export default function AdminNotificationsPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Push Notifications</h1>
                <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Send alerts, announcements, and emails to your artists</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 32 }}>
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Compose Message</h2>
                    
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Target Audience</label>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', border: '1px solid var(--primary)', borderRadius: 8, background: '#fef2f2', cursor: 'pointer', flex: 1 }}>
                                <input type="radio" name="audience" defaultChecked style={{ accentColor: 'var(--primary)' }} />
                                <Users size={16} color="var(--primary)" />
                                <span style={{ fontWeight: 500, color: 'var(--primary)' }}>All Users (12,450)</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', flex: 1 }}>
                                <input type="radio" name="audience" style={{ accentColor: 'var(--primary)' }} />
                                <User size={16} color="#6b7280" />
                                <span style={{ fontWeight: 500, color: '#4b5563' }}>Pro Subscribers (3,240)</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Notification Title</label>
                        <input type="text" className="input-field" placeholder="E.g., Special Holiday Promo!" />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Message Body</label>
                        <textarea className="input-field" rows={5} placeholder="Type your announcement here..."></textarea>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                        <input type="checkbox" id="sendEmail" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                        <label htmlFor="sendEmail" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Also send as an Email Broadcast</label>
                    </div>

                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}>
                        <Send size={18} /> Send to Audience
                    </button>
                </div>

                <div>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Broadcasts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', gap: 12, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={16} color="#6b7280" /></div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>System Maintenance</div>
                                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Sent to All Users • 2 days ago</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ width: 36, height: 36, background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={16} color="#d97706" /></div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>New Royalty Split Feature!</div>
                                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Sent to Pro Users • 1 week ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
