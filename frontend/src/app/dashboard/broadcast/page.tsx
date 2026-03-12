'use client';
import { motion } from 'framer-motion';
import { Tv, PlayCircle, Info } from 'lucide-react';

export default function BroadcastPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">Broadcast on TV</h1>
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>Get your music videos featured on 100+ partner TV channels across India.</div>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Tv size={18} /> Submit Video</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 32 }}>
                <div>
                    <div style={{ background: '#fef3c7', padding: 16, borderRadius: 8, display: 'flex', gap: 12, marginBottom: 32, color: '#92400e', fontSize: 14, alignItems: 'flex-start' }}>
                        <Info size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div><strong>Submission Guidelines:</strong> Videos must be 1080p or 4K, MP4 format, free of explicit content, and you must own 100% of the copyrights.</div>
                    </div>

                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>My TV Submissions</h2>
                    
                    <div className="card" style={{ padding: 24, textAlign: 'center', color: '#6b7280', borderStyle: 'dashed', borderWidth: 2, borderColor: '#e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><PlayCircle size={48} color="#d1d5db" /></div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No Submissions Yet</h3>
                        <p style={{ fontSize: 14, marginBottom: 24 }}>Submit your first music video to reach millions of television viewers.</p>
                        <button className="btn btn-primary">Start Submission</button>
                    </div>
                </div>

                <div>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Partner Channels</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📺</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>9XM</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>National Music</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>MTV Indie</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>Independent Music</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📻</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>Vh1 India</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>International & Indie</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
