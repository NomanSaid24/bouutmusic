'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

const MOCK_ALBUMS = Array.from({ length: 15 }, (_, i) => ({
    id: String(i + 1),
    title: ['Echoes of Silence', 'Neon Beats', 'Desert Rain', 'Midnight Drive', 'Summer Vibes', 'Lost in City', 'Acoustic Soul', 'Vinyl Memories', 'Future Sound', 'Vintage Dreams'][i % 10],
    artist: ['Aryan Kapoor', 'Priya Singh', 'DJ Maverick', 'Raza Khan', 'Zara Ahmed', 'Dev Sharma', 'Meera Nair'][i % 7],
    artUrl: `https://images.unsplash.com/photo-${['1614613535308-eb5fbd3d2c17', '1614680376573-040ba921e428', '1619983081563-440f536006c9', '1493225457124-a3eb161ffa5f', '1470225620780-dba8ba36b745', '1511671782779-c97d3d27a1d4'][i % 6]}?w=300&h=300&fit=crop`,
    year: 2024 - (i % 3)
}));

export default function AlbumsPage() {
    const { playTrack } = usePlayerStore();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
            <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Albums</div>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">Albums</h1>
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>Discover complete collections from our independent artists</div>
                </div>
                <Link href="/dashboard/release/create" className="btn btn-primary">Publish Album</Link>
            </div>

            <motion.div 
                className="cards-grid-5"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                {MOCK_ALBUMS.map(album => (
                    <motion.div 
                        key={album.id} 
                        className="card song-card"
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    >
                        <div className="song-card-art-wrapper" style={{ borderRadius: 8 }}>
                            <img className="song-card-art" src={album.artUrl} alt={album.title} />
                            <div className="song-card-play-overlay" onClick={() => playTrack({ id: `album-${album.id}`, title: album.title, artist: album.artist, artUrl: album.artUrl })}>
                                <button className="play-btn-circle" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}><Play fill="currentColor" size={20} style={{ marginLeft: 3 }} /></button>
                            </div>
                        </div>
                        <div className="song-card-info">
                            <div className="song-card-title">{album.title}</div>
                            <div className="song-card-artist">{album.artist} • {album.year}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
