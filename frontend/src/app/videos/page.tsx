'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

const MOCK_VIDEOS = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    title: ['Live at The Garden', 'Acoustic Sessions Episode 1', 'Behind the Music: Neon Beats', 'Studio Vlogs #4', 'Summer Festival 2023 Highlights', 'The Journey: Interview with Raza', 'Making of "City Lights"'][i % 7],
    artist: ['Aryan Kapoor', 'Bouut Originals', 'DJ Maverick', 'Raza Khan', 'Zara Ahmed', 'Dev Sharma'][i % 6],
    thumbnail: `https://images.unsplash.com/photo-${['1516450360452-9312f5e86fc7', '1470225620780-dba8ba36b745', '1493225457124-a3eb161ffa5f', '1598387993281-cecf8b71a8f8'][i % 4]}?w=600&h=340&fit=crop`,
    views: Math.floor(Math.random() * 500) + 'K',
    duration: ['03:45', '12:20', '08:15', '04:30', '45:00'][i % 5]
}));

export default function VideosPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
            <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Videos</div>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">Bouut TV</h1>
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>Exclusive music videos, interviews, and live performances</div>
                </div>
            </div>

            <motion.div 
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                {MOCK_VIDEOS.map(video => (
                    <motion.div 
                        key={video.id} 
                        style={{ cursor: 'pointer' }}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    >
                        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', marginBottom: 12, border: '1px solid #e5e7eb' }}>
                            <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="vid-overlay">
                                <PlayCircle color="white" size={48} />
                            </div>
                            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>
                                {video.duration}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{video.title}</div>
                            <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{video.artist}</span>
                                <span>{video.views} views</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            
            <style jsx>{`
                .vid-overlay:hover { opacity: 1 !important; }
            `}</style>
        </motion.div>
    );
}
