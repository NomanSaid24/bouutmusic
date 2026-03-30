'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatArtistLocation, getPrimaryArtistType } from '@/lib/profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ArtistCard {
    id: string;
    slug?: string | null;
    name: string;
    avatar?: string | null;
    artistTypes?: string[];
    genre?: string | null;
    city?: string | null;
    country?: string | null;
    isPro?: boolean;
}

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
}

export default function ArtistsPage() {
    const [artists, setArtists] = useState<ArtistCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadArtists() {
            try {
                const response = await fetch(`${API_URL}/api/artists`, { cache: 'no-store' });
                const payload = await response.json().catch(() => null);

                if (!response.ok || !payload?.artists) {
                    throw new Error('Failed to load artists');
                }

                if (isMounted) {
                    setArtists(payload.artists as ArtistCard[]);
                }
            } catch {
                if (isMounted) {
                    setArtists([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadArtists();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div>
            <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Artists</div>
            <div className="page-header">
                <h1 className="page-title">Artists</h1>
            </div>

            {isLoading ? (
                <div className="card" style={{ padding: 24 }}>Loading artists...</div>
            ) : (
                <div className="cards-grid-5">
                    {artists.map(artist => (
                        <Link
                            key={artist.id}
                            href={artist.slug ? `/${artist.slug}` : `/artists/${artist.id}`}
                            className="card artist-card"
                            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                        >
                            <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
                                {artist.avatar ? (
                                    <img className="artist-avatar" src={artist.avatar} alt={artist.name} />
                                ) : (
                                    <div className="artist-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#edf2ff', color: '#1041b6', fontWeight: 700 }}>
                                        {getInitials(artist.name)}
                                    </div>
                                )}
                                {artist.isPro && <span className="pro-badge" style={{ position: 'absolute', bottom: 8, right: -4 }}>PRO</span>}
                            </div>
                            <div className="artist-name" style={{ marginTop: 6 }}>{artist.name}</div>
                            <div className="artist-genre">{getPrimaryArtistType(artist.artistTypes || [])}</div>
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                                {formatArtistLocation({ country: artist.country, city: artist.city })}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

