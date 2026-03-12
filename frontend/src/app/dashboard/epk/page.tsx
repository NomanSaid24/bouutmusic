'use client';
import { motion } from 'framer-motion';
import { Save, Image as ImageIcon, Link as LinkIcon, Edit3 } from 'lucide-react';

export default function EPKEditor() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">e-Press Kit Editor</h1>
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>Manage your public artist profile, bio, and social links.</div>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Save size={18} /> Save Changes</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                <div>
                    {/* Basic Info */}
                    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>Basic Information</h2>
                        
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Artist / Band Name</label>
                            <input type="text" className="input-field" defaultValue="Aryan Kapoor" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Location</label>
                                <input type="text" className="input-field" defaultValue="Mumbai, India" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Genre</label>
                                <select className="input-field">
                                    <option>Bollywood</option>
                                    <option>Pop</option>
                                    <option>Electronic</option>
                                    <option>Hip Hop</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Biography</label>
                            <textarea className="input-field" rows={5} defaultValue="Aryan Kapoor is an independent music producer..."></textarea>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="card" style={{ padding: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>Social Media Links</h2>
                        
                        {['Instagram', 'Twitter', 'YouTube', 'Spotify'].map(platform => (
                            <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 100, fontSize: 13, fontWeight: 500, color: '#4b5563' }}>{platform}</div>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <LinkIcon size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
                                    <input type="text" className="input-field" placeholder={`https://${platform.toLowerCase()}.com/username`} style={{ paddingLeft: 36 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar (Images) */}
                <div>
                    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Profile Avatar</h2>
                            <Edit3 size={16} color="var(--primary)" style={{ cursor: 'pointer' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} alt="Avatar" />
                            <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>Recommended: 400x400px JPG or PNG</div>
                            <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>Change Avatar</button>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Banner Image</h2>
                            <ImageIcon size={16} color="var(--primary)" style={{ cursor: 'pointer' }} />
                        </div>
                        <div style={{ position: 'relative', height: 100, borderRadius: 8, overflow: 'hidden', marginBottom: 16, border: '1px solid #e5e7eb' }}>
                            <img src="https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=400&h=200&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Banner" />
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>Recommended: 1200x400px</div>
                        <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>Upload New Banner</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
