'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string;
}

const ICONS: Record<string, string> = {
    'Demo Review': '🎧',
    'Submit my demo': '🎧',
    'Playlist Promotion': '📋',
    'Spotify Playlisting': '📋',
    'Music Marketing': '🚀',
    'Artist Growth': '🚀',
    'Get Playlisted': '⭐',
    'Music Distribution': '🌍',
    'Release your music': '🌍',
    'Broadcast on TV': '📺',
    'YouTube promotion': '🎥',
    'Influencer Marketing': '📱',
    'Social Media Management': '💬',
    'Graphic Design': '🎨',
    'Video Editing': '🎬',
    'Website Development': '💻',
    'PR & Branding': '📢',
    'Sync Licensing': '🎵',
    'Radio Promotion': '📻',
    'Consultation': '🤝'
};

export default function PromoToolsPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await fetch(`${apiUrl}/api/services`);
                if (res.ok) {
                    const data = await res.json();
                    setServices(data);
                }
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading services...</div>;

    return (
        <div>
            <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span> Promote</div>
            <div className="page-header">
                <h1 className="page-title">Promo Tools & Services</h1>
                <p className="text-gray-500 mt-2">Grow your music career with our professional promotion tools and services.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
                {services.map(s => (
                    <div key={s.id} className="card" style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 36, flexShrink: 0 }}>{ICONS[s.name] || '📦'}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{s.name}</div>
                            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>{s.description}</div>
                            
                            {/* Features list */}
                            <div className="mb-4 space-y-1">
                                {JSON.parse(s.features).slice(0, 3).map((f: string, i: number) => (
                                    <div key={i} className="text-xs text-gray-400 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-primary rounded-full" /> {f}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>
                                    {s.price === 0 ? 'Free' : `₹${s.price.toLocaleString()}`}
                                </span>
                                <Link 
                                    href={`/dashboard/promo-tools/${s.id}`}
                                    className="btn btn-primary btn-sm"
                                >
                                    Submit Request
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

