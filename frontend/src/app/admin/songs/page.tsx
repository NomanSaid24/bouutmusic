'use client';
import { motion } from 'framer-motion';
import { Search, Filter, PlayCircle, Check, X } from 'lucide-react';

const MOCK_SONGS = [
    { id: 1, title: 'Summer Breeze', artist: 'Neon Dreams', genre: 'Synthwave', uploaded: '2 hours ago', status: 'Pending Review', art: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&h=80&fit=crop' },
    { id: 2, title: 'Mountain Echo', artist: 'Folk Tales', genre: 'Acoustic', uploaded: '5 hours ago', status: 'Pending Review', art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop' },
    { id: 3, title: 'Urban Jungle', artist: 'Raza Khan', genre: 'Hip Hop', uploaded: '1 day ago', status: 'Approved', art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop' },
    { id: 4, title: 'Starlight', artist: 'Priya Singh', genre: 'Pop', uploaded: '2 days ago', status: 'Approved', art: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop' },
    { id: 5, title: 'Distortion', artist: 'The Noise', genre: 'Metal', uploaded: '3 days ago', status: 'Rejected', art: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=80&h=80&fit=crop' },
];

export default function AdminSongsPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Songs Approval</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Review newly uploaded tracks before distribution</div>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, background: '#fef2f2', border: '1px solid #fee2e2' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>12</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#b91c1c' }}>PENDING<br/>REVIEWS</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {/* Toolbar */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: '8px 8px 0 0' }}>
                    <div className="tabs" style={{ marginBottom: 0 }}>
                        <button className="tab active" style={{ padding: '6px 16px', fontSize: 13 }}>Needs Review (12)</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>Approved</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>Rejected</button>
                        <button className="tab" style={{ padding: '6px 16px', fontSize: 13 }}>All</button>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ position: 'relative', width: 250 }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                            <input type="text" className="input-field" placeholder="Search song or artist..." style={{ paddingLeft: 36, height: 36, background: 'white' }} />
                        </div>
                        <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white' }}><Filter size={14} /> Filter</button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Track</th>
                                <th>Artist</th>
                                <th>Genre</th>
                                <th>Uploaded</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Review Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_SONGS.map(song => (
                                <tr key={song.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}>
                                                <img src={song.art} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <PlayCircle color="white" size={20} />
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{song.title}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#4b5563', fontWeight: 500 }}>{song.artist}</td>
                                    <td style={{ color: '#6b7280' }}>{song.genre}</td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>{song.uploaded}</td>
                                    <td>
                                        <span className={`badge badge-${song.status === 'Approved' ? 'green' : song.status === 'Rejected' ? 'red' : 'yellow'}`}>
                                            {song.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {song.status === 'Pending Review' ? (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <button className="btn btn-primary" style={{ padding: '6px 12px', height: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button className="btn btn-outline" style={{ padding: '6px 12px', height: 'auto', display: 'flex', alignItems: 'center', gap: 6, borderColor: '#fee2e2', color: 'var(--primary)', background: '#fef2f2' }}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-ghost btn-sm" style={{ color: '#6b7280' }}>View Details</button>
                                        )}
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
