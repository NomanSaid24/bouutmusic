'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ExternalLink, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatArtistLocation, getPrimaryArtistType } from '@/lib/profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RoasterArtist {
    id: string;
    slug?: string | null;
    name: string;
    email?: string;
    avatar?: string | null;
    banner?: string | null;
    artistTypes?: string[];
    genre?: string | null;
    city?: string | null;
    country?: string | null;
    isPro?: boolean;
    roasterOrder?: number;
}

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
}

function getPublicHref(artist: RoasterArtist) {
    return artist.slug ? `/${artist.slug}` : `/artists/${artist.id}`;
}

function getArtistImage(artist: RoasterArtist) {
    return artist.avatar || artist.banner || null;
}

function ArtistMeta({ artist }: { artist: RoasterArtist }) {
    const artistType = getPrimaryArtistType(artist.artistTypes || []);
    const location = formatArtistLocation({ country: artist.country, city: artist.city });

    return (
        <div className="admin-roaster-meta">
            {artistType && <span>{artistType}</span>}
            {artist.genre && artist.genre !== artistType && <span>{artist.genre}</span>}
            {location && <span>{location}</span>}
            {artist.isPro && <span>Pro</span>}
        </div>
    );
}

export default function AdminRoasterPage() {
    const { token } = useAuth();
    const [featuredArtists, setFeaturedArtists] = useState<RoasterArtist[]>([]);
    const [candidates, setCandidates] = useState<RoasterArtist[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const headers = useMemo(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }), [token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        async function loadRoaster() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/api/admin/roaster`, {
                    headers,
                    cache: 'no-store',
                });
                const payload = await response.json().catch(() => null) as { artists?: RoasterArtist[]; error?: string } | null;

                if (!response.ok || !payload?.artists) {
                    throw new Error(payload?.error || 'Failed to load roaster');
                }

                if (isMounted) {
                    setFeaturedArtists(payload.artists);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Failed to load roaster');
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
    }, [headers, token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;
        const timeoutId = window.setTimeout(async () => {
            setIsSearching(true);
            try {
                const params = new URLSearchParams();
                if (search.trim()) {
                    params.set('search', search.trim());
                }

                const response = await fetch(`${API_URL}/api/admin/roaster/candidates?${params.toString()}`, {
                    headers,
                    cache: 'no-store',
                });
                const payload = await response.json().catch(() => null) as { artists?: RoasterArtist[] } | null;

                if (isMounted && response.ok && payload?.artists) {
                    setCandidates(payload.artists);
                }
            } finally {
                if (isMounted) {
                    setIsSearching(false);
                }
            }
        }, 240);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);
        };
    }, [headers, search, token, featuredArtists.length]);

    async function addArtist(artistId: string) {
        if (!token) {
            return;
        }

        setBusyId(artistId);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/roaster`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ userId: artistId }),
            });
            const payload = await response.json().catch(() => null) as RoasterArtist | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(payload && 'error' in payload && payload.error ? payload.error : 'Failed to add artist');
            }

            setFeaturedArtists(previous => [...previous, payload]);
            setCandidates(previous => previous.filter(candidate => candidate.id !== artistId));
        } catch (addError) {
            setError(addError instanceof Error ? addError.message : 'Failed to add artist');
        } finally {
            setBusyId(null);
        }
    }

    async function removeArtist(artistId: string) {
        if (!token) {
            return;
        }

        setBusyId(artistId);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/roaster/${artistId}`, {
                method: 'DELETE',
                headers,
            });
            const payload = await response.json().catch(() => null) as { error?: string } | null;

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to remove artist');
            }

            setFeaturedArtists(previous => previous.filter(artist => artist.id !== artistId));
        } catch (removeError) {
            setError(removeError instanceof Error ? removeError.message : 'Failed to remove artist');
        } finally {
            setBusyId(null);
        }
    }

    async function reorderArtist(index: number, direction: -1 | 1) {
        const nextIndex = index + direction;

        if (nextIndex < 0 || nextIndex >= featuredArtists.length || !token) {
            return;
        }

        const nextArtists = [...featuredArtists];
        [nextArtists[index], nextArtists[nextIndex]] = [nextArtists[nextIndex], nextArtists[index]];
        setFeaturedArtists(nextArtists);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/roaster/order`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ artistIds: nextArtists.map(artist => artist.id) }),
            });
            const payload = await response.json().catch(() => null) as { artists?: RoasterArtist[]; error?: string } | null;

            if (!response.ok || !payload?.artists) {
                throw new Error(payload?.error || 'Failed to reorder roaster');
            }

            setFeaturedArtists(payload.artists);
        } catch (reorderError) {
            setError(reorderError instanceof Error ? reorderError.message : 'Failed to reorder roaster');
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-roaster-page">
            <div className="admin-roaster-header">
                <div>
                    <span className="admin-roaster-kicker"><Star size={15} /> Featured Artists</span>
                    <h1>Roaster</h1>
                    <p>Choose which artist profiles appear on the public Roaster page.</p>
                </div>
                <Link href="/roaster" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff' }}>
                    <ExternalLink size={15} />
                    View Roaster
                </Link>
            </div>

            {error && <div className="admin-roaster-alert">{error}</div>}

            <div className="admin-roaster-layout">
                <section className="admin-roaster-panel">
                    <div className="admin-roaster-panel-head">
                        <div>
                            <h2>Featured Now</h2>
                            <span>{featuredArtists.length} artists</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="admin-roaster-empty">Loading roaster...</div>
                    ) : featuredArtists.length === 0 ? (
                        <div className="admin-roaster-empty">Search artists and add them to start the Roaster.</div>
                    ) : (
                        <div className="admin-roaster-list">
                            {featuredArtists.map((artist, index) => {
                                const image = getArtistImage(artist);

                                return (
                                    <article key={artist.id} className="admin-roaster-featured-card">
                                        <div className="admin-roaster-avatar">
                                            {image ? <img src={image} alt={artist.name} /> : <span>{getInitials(artist.name)}</span>}
                                        </div>
                                        <div className="admin-roaster-featured-copy">
                                            <div className="admin-roaster-featured-title">
                                                <strong>{artist.name}</strong>
                                                <Link href={getPublicHref(artist)} title="Open public profile">
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                            {artist.email && <span className="admin-roaster-email">{artist.email}</span>}
                                            <ArtistMeta artist={artist} />
                                        </div>
                                        <div className="admin-roaster-actions">
                                            <button type="button" className="admin-roaster-icon-btn" onClick={() => void reorderArtist(index, -1)} disabled={index === 0} title="Move up">
                                                <ArrowUp size={15} />
                                            </button>
                                            <button type="button" className="admin-roaster-icon-btn" onClick={() => void reorderArtist(index, 1)} disabled={index === featuredArtists.length - 1} title="Move down">
                                                <ArrowDown size={15} />
                                            </button>
                                            <button type="button" className="admin-roaster-icon-btn danger" onClick={() => void removeArtist(artist.id)} disabled={busyId === artist.id} title="Remove">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <aside className="admin-roaster-panel admin-roaster-search-panel">
                    <div className="admin-roaster-search">
                        <Search size={16} />
                        <input
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search existing artists..."
                        />
                    </div>

                    <div className="admin-roaster-candidates">
                        {isSearching ? (
                            <div className="admin-roaster-empty">Searching artists...</div>
                        ) : candidates.length === 0 ? (
                            <div className="admin-roaster-empty">No available artists found.</div>
                        ) : candidates.map(artist => {
                            const image = getArtistImage(artist);

                            return (
                                <article key={artist.id} className="admin-roaster-candidate">
                                    <div className="admin-roaster-avatar small">
                                        {image ? <img src={image} alt={artist.name} /> : <span>{getInitials(artist.name)}</span>}
                                    </div>
                                    <div>
                                        <strong>{artist.name}</strong>
                                        {artist.email && <span>{artist.email}</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => void addArtist(artist.id)}
                                        disabled={busyId === artist.id}
                                    >
                                        <Plus size={14} />
                                        Add
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                </aside>
            </div>
        </motion.div>
    );
}
