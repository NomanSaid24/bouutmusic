'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

const ALL_RESULTS = {
    songs: [
        { id: '1', title: 'Dil Ka Safar', artist: 'Aryan Kapoor', artUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop' },
        { id: '2', title: 'Midnight Dreams', artist: 'Priya Singh', artUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=60&h=60&fit=crop' },
    ],
    artists: [
        { id: '1', name: 'Aryan Kapoor', genre: 'Bollywood', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face' },
        { id: '2', name: 'Priya Singh', genre: 'Pop', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face' },
    ],
};

export default function SearchPage() {
    const [q, setQ] = useState('');
    const hasQ = q.trim().length > 0;

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Search</h1></div>
            <div style={{ position: 'relative', maxWidth: 560, marginBottom: 32 }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input className="form-input" style={{ paddingLeft: 44, fontSize: 15, padding: '12px 14px 12px 44px', borderRadius: 50 }} placeholder="Search songs, artists, albums..." value={q} onChange={e => setQ(e.target.value)} autoFocus />
            </div>

            {hasQ ? (
                <div>
                    <div className="section">
                        <div className="section-title" style={{ marginBottom: 14 }}>Songs</div>
                        {ALL_RESULTS.songs.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                                <img src={s.artUrl} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} alt={s.title} />
                                <div><div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div><div style={{ fontSize: 12, color: '#6b7280' }}>{s.artist}</div></div>
                                <button className="play-btn-circle" style={{ marginLeft: 'auto', width: 32, height: 32 }}>▶</button>
                            </div>
                        ))}
                    </div>
                    <div className="section">
                        <div className="section-title" style={{ marginBottom: 14 }}>Artists</div>
                        <div className="cards-grid-5">
                            {ALL_RESULTS.artists.map(a => (
                                <div key={a.id} className="card artist-card">
                                    <img className="artist-avatar" src={a.avatar} alt={a.name} />
                                    <div className="artist-name">{a.name}</div>
                                    <div className="artist-genre">{a.genre}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af' }}>
                    <Search size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#6b7280' }}>Search for songs, artists, albums</div>
                </div>
            )}
        </div>
    );
}
