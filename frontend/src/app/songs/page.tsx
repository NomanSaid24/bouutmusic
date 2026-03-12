'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { PlayCircle, Filter, Search } from 'lucide-react';
import { SongCardSkeleton } from '@/components/UI/Skeleton';

const GENRES = ['All', 'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Folk', 'Indie', 'Bollywood', 'Sufi', 'Punjabi', 'EDM'];
const TABS = ['ALL', 'SELECT', 'POPULAR', 'LATEST'];

const MOCK_SONGS = Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1),
    title: ['Dil Ka Safar', 'Midnight Dreams', 'Electric Soul', 'Noor', 'City Lights', 'Tere Bina', 'Pahadi Echoes', 'Street Code', 'Chandni Raat', 'Ocean Waves', 'Kho Gaye Hum', 'Bass Drop', 'Meri Kahani', 'Yaadein', 'Digital Love', 'Colors', 'Zindagi', 'Jungle Beat', 'Fireflies', 'Roohani'][i],
    artist: ['Aryan Kapoor', 'Priya Singh', 'DJ Maverick', 'Raza Khan', 'Zara Ahmed', 'Dev Sharma', 'Meera Nair', 'Farhan Ali', 'Noor Fatima', 'Vikram Das'][i % 10],
    genre: GENRES[(i % (GENRES.length - 1)) + 1],
    artUrl: `https://images.unsplash.com/photo-${['1493225457124-a3eb161ffa5f', '1470225620780-dba8ba36b745', '1511671782779-c97d3d27a1d4', '1487215078519-e21cc028cb29', '1514320291840-2e0a9bf2a9ae', '1571330735066-03aaa9429d89', '1508700115892-45ecd05ae2ad', '1598387993281-cecf8b71a8f8', '1445985543470-41fba5c3144a', '1516450360452-9312f5e86fc7'][i % 10]}?w=300&h=300&fit=crop`,
    plays: Math.floor(Math.random() * 500000),
}));

export default function SongsPage() {
    const { playTrack } = usePlayerStore();
    const [activeTab, setActiveTab] = useState('ALL');
    const [genre, setGenre] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filtered = MOCK_SONGS.filter(s => genre === 'All' || s.genre === genre);

    return (
        <div style={{ padding: '0 20px 40px' }}>
            <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Songs</div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Songs</h1>
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>Explore all tracks on bOUUT MUSIC.</div>
                </div>
                <Link href="/dashboard/release/create" className="btn btn-primary">Upload Your Song</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
                <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
                    {TABS.map(t => (
                        <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                    ))}
                </div>
                <div className="filter-bar">
                    <label style={{ fontSize: 13, color: '#6b7280' }}>Genre:</label>
                    <select className="filter-select" value={genre} onChange={e => setGenre(e.target.value)}>
                        {GENRES.map(g => <option key={g}>{g}</option>)}
                    </select>
                </div>
            </div>
            <div style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: 24 }} />

            <div className="section">
                <div className="section-header">
                    <div>
                        <div className="section-title">{genre === 'All' ? 'Recommended Songs' : `${genre} Hits`}</div>
                        <div className="section-subtitle">Top tracks curated by our editorial team</div>
                    </div>
                </div>
                
                {loading ? (
                    <div className="cards-grid-5">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <SongCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        className="cards-grid-5"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                    >
                        {filtered.map(song => (
                            <motion.div 
                                key={song.id} 
                                className="card song-card"
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                onClick={() => playTrack({ id: song.id, title: song.title, artist: song.artist, artUrl: song.artUrl })}
                            >
                                <div className="song-card-art-wrapper">
                                    <img className="song-card-art" src={song.artUrl} alt={song.title} />
                                    <div className="song-card-play-overlay">
                                        <button className="play-btn-circle" style={{ pointerEvents: 'none' }}>▶</button>
                                    </div>
                                </div>
                                <div className="song-card-info">
                                    <div className="song-card-title">{song.title}</div>
                                    <div className="song-card-artist">{song.artist}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
