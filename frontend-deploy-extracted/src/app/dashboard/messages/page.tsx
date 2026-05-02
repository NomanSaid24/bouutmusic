'use client';
import { motion } from 'framer-motion';
import { Search, Send } from 'lucide-react';

const MESSAGES = [
    { id: 1, name: 'Support Team', preview: 'Your recent submission has been approved...', time: '10:30 AM', unread: true },
    { id: 2, name: 'Riya Dev (A&R)', preview: 'Hey Aryan, loved the new track! Are you open to...', time: 'Yesterday', unread: false },
    { id: 3, name: 'Bouut TV', preview: 'Congratulations! Your video has been shortlisted.', time: 'Mar 10', unread: false },
    { id: 4, name: 'Billing', preview: 'Invoice #INV-2938 for your Pro Subscription is a...', time: 'Mar 05', unread: false },
];

export default function MessagesPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 24 }}>
                <h1 className="page-title">Messages</h1>
            </div>

            <div className="card" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Inbox List */}
                <div style={{ width: 320, borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: 16, borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                            <input type="text" className="input-field" placeholder="Search messages..." style={{ paddingLeft: 36, fontSize: 13, height: 36 }} />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {MESSAGES.map(msg => (
                            <div key={msg.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f9fafb', cursor: 'pointer', background: msg.unread ? '#fefce8' : 'white', borderLeft: msg.unread ? '3px solid var(--primary)' : '3px solid transparent' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <div style={{ fontWeight: msg.unread ? 700 : 600, fontSize: 14 }}>{msg.name}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{msg.time}</div>
                                </div>
                                <div style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {msg.preview}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Chat */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fbbf24)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>ST</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>Support Team</div>
                            <div style={{ fontSize: 12, color: '#10b981' }}>Online</div>
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f9fafb' }}>
                        <div style={{ alignSelf: 'center', fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '4px 12px', borderRadius: 12 }}>Today</div>
                        
                        <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
                            <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px 12px 12px 0', fontSize: 14, color: '#374151', border: '1px solid #f3f4f6' }}>
                                Hi Aryan, your recent submission "Dil Ka Safar" has been approved for distribution. It will be live on Spotify within 48 hours. Let us know if you have any questions!
                            </div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>10:30 AM</div>
                        </div>
                    </div>

                    <div style={{ padding: 16, borderTop: '1px solid #f3f4f6', background: 'white' }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input type="text" className="input-field" placeholder="Type a message..." style={{ background: '#f9fafb', flex: 1 }} />
                            <button className="btn btn-primary btn-icon" style={{ borderRadius: '50%', width: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={18} style={{ marginLeft: -2 }} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
