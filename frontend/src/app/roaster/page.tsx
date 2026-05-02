'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { formatArtistLocation, getPrimaryArtistType } from '@/lib/profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RoasterArtist {
    id: string;
    slug?: string | null;
    name: string;
    avatar?: string | null;
    banner?: string | null;
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

function getArtistImage(artist: RoasterArtist) {
    return artist.avatar || artist.banner || null;
}

export default function RoasterPage() {
    const [artists, setArtists] = useState<RoasterArtist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadRoaster() {
            try {
                const response = await fetch(`${API_URL}/api/artists/roaster`, { cache: 'no-store' });
                const payload = await response.json().catch(() => null) as { artists?: RoasterArtist[] } | null;

                if (!response.ok || !payload?.artists) {
                    throw new Error('Failed to load roaster');
                }

                if (isMounted) {
                    setArtists(payload.artists);
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

        void loadRoaster();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="roaster-page">
            <div className="roaster-shell">
                <div className="breadcrumb roaster-breadcrumb"><Link href="/">Home</Link><span>/</span> Roaster</div>

                <div className="roaster-heading">
                    <span className="roaster-kicker"><Sparkles size={15} /> Bouut Roaster</span>
                    <h1>Roaster</h1>
                </div>

                {isLoading ? (
                    <div className="roaster-state">Loading roaster...</div>
                ) : artists.length === 0 ? (
                    <div className="roaster-state">No featured artists yet.</div>
                ) : (
                    <div className="roaster-grid">
                        {artists.map(artist => {
                            const location = formatArtistLocation({ country: artist.country, city: artist.city });
                            const image = getArtistImage(artist);
                            const artistType = getPrimaryArtistType(artist.artistTypes || []);

                            return (
                                <Link
                                    key={artist.id}
                                    href={artist.slug ? `/${artist.slug}` : `/artists/${artist.id}`}
                                    className="roaster-card"
                                >
                                    <span className="roaster-card-media">
                                        {image ? (
                                            <img src={image} alt={artist.name} />
                                        ) : (
                                            <span className="roaster-card-fallback">{getInitials(artist.name)}</span>
                                        )}
                                    </span>
                                    <span className="roaster-card-body">
                                        <span className="roaster-card-title-row">
                                            <span className="roaster-card-name">{artist.name}</span>
                                            <ArrowUpRight size={20} />
                                        </span>
                                        <span className="roaster-card-tags">
                                            {location && <span>{location}</span>}
                                            {artistType && <span>{artistType}</span>}
                                            {artist.genre && artist.genre !== artistType && <span>{artist.genre}</span>}
                                            {artist.isPro && <span>Pro</span>}
                                        </span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
