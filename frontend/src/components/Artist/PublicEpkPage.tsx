'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Facebook,
    Globe,
    Instagram,
    MapPin,
    Music2,
    Play,
    Share2,
    Twitter,
    Youtube,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePlayerStore } from '@/store/playerStore';
import { formatArtistLocation, getPrimaryArtistType } from '@/lib/profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ArtistSong {
    id: string;
    title: string;
    artUrl: string;
    audioUrl?: string;
    plays: number;
}

interface PublicArtistProfile {
    id: string;
    slug?: string | null;
    name: string;
    avatar?: string | null;
    banner?: string | null;
    bio?: string | null;
    artistTypes?: string[];
    genre?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    spotify?: string | null;
    isPro?: boolean;
    followerCount?: number;
    songs?: ArtistSong[];
}

function cleanSocialLink(value?: string | null) {
    if (!value) {
        return null;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    if (value.startsWith('@')) {
        return value.slice(1);
    }

    return value;
}

function buildSocialHref(platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'website', value?: string | null) {
    if (!value) {
        return null;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    const normalized = cleanSocialLink(value);
    if (!normalized) {
        return null;
    }

    switch (platform) {
        case 'instagram':
            return `https://instagram.com/${normalized}`;
        case 'facebook':
            return `https://facebook.com/${normalized}`;
        case 'twitter':
            return `https://x.com/${normalized}`;
        case 'youtube':
            return `https://youtube.com/${normalized}`;
        case 'website':
        default:
            return normalized.startsWith('www.') ? `https://${normalized}` : `https://${normalized}`;
    }
}

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
}

export function PublicEpkPage({ identifier }: { identifier: string }) {
    const { user } = useAuth();
    const { playTrack } = usePlayerStore();
    const [artist, setArtist] = useState<PublicArtistProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadArtist() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/api/artists/${identifier}`, { cache: 'no-store' });
                const payload = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(payload?.error || 'Artist not found');
                }

                if (isMounted) {
                    setArtist(payload as PublicArtistProfile);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Artist not found');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadArtist();

        return () => {
            isMounted = false;
        };
    }, [identifier]);

    const locationLabel = useMemo(() => formatArtistLocation({
        country: artist?.country,
        state: artist?.state,
        city: artist?.city,
    }), [artist?.city, artist?.country, artist?.state]);

    const primaryArtistType = useMemo(() => getPrimaryArtistType(artist?.artistTypes || []), [artist?.artistTypes]);

    if (isLoading) {
        return <div className="card" style={{ padding: 28 }}>Loading artist profile...</div>;
    }

    if (!artist || error) {
        return <div className="card" style={{ padding: 28 }}>{error || 'Artist not found'}</div>;
    }

    const socialLinks = [
        { href: buildSocialHref('instagram', artist.instagram), icon: <Instagram size={17} />, label: 'Instagram' },
        { href: buildSocialHref('facebook', artist.facebook), icon: <Facebook size={17} />, label: 'Facebook' },
        { href: buildSocialHref('twitter', artist.twitter), icon: <Twitter size={17} />, label: 'X' },
        { href: buildSocialHref('youtube', artist.youtube), icon: <Youtube size={17} />, label: 'YouTube' },
        { href: buildSocialHref('website', artist.website), icon: <Globe size={17} />, label: 'Website' },
    ].filter(item => item.href);

    const previewTrack = artist.songs?.[0];
    const isOwner = !!user && (user.id === artist.id || user.slug === artist.slug);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="public-epk-page">
            <div className="public-epk-shell">
                <section className="public-epk-hero">
                    <div className="public-epk-banner" style={artist.banner ? { backgroundImage: `url(${artist.banner})` } : undefined} />
                    <div className="public-epk-banner-overlay" />

                    <div className="public-epk-header-row">
                        {artist.avatar ? (
                            <img src={artist.avatar} alt={artist.name} className="public-epk-avatar" />
                        ) : (
                            <div className="public-epk-avatar public-epk-avatar-fallback">{getInitials(artist.name)}</div>
                        )}

                        <div className="public-epk-header-copy">
                            <div className="public-epk-name-row">
                                <h1>{artist.name}</h1>
                                {artist.isPro && <CheckCircle2 size={22} color="#3158ff" fill="#ebf0ff" />}
                            </div>

                            <div className="public-epk-meta-list">
                                <span>{primaryArtistType}</span>
                                {locationLabel && <span><MapPin size={14} /> {locationLabel}</span>}
                                {artist.genre && <span>{artist.genre}</span>}
                            </div>
                        </div>

                        <div className="public-epk-actions">
                            {socialLinks.map(item => (
                                <a key={item.label} href={item.href!} target="_blank" rel="noreferrer" className="public-epk-social">
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="public-epk-content">
                    <div className="public-epk-main">
                        <section className="card public-epk-card">
                            <div className="public-epk-card-title">Story</div>
                            <p className="public-epk-story">
                                {artist.bio || 'This artist has not added a biography yet.'}
                            </p>
                        </section>

                        <section className="card public-epk-card">
                            <div className="public-epk-card-title">Top Tracks</div>
                            <div className="public-epk-song-list">
                                {(artist.songs?.length ? artist.songs : []).map((song, index) => (
                                    <button
                                        key={song.id}
                                        className="public-epk-song-row"
                                        onClick={() => playTrack({
                                            id: song.id,
                                            title: song.title,
                                            artist: artist.name,
                                            artUrl: song.artUrl,
                                            audioUrl: song.audioUrl,
                                        })}
                                        type="button"
                                    >
                                        <span className="public-epk-song-index">{index + 1}</span>
                                        <img src={song.artUrl} alt={song.title} className="public-epk-song-art" />
                                        <span className="public-epk-song-title">{song.title}</span>
                                        <span className="public-epk-song-plays">{song.plays?.toLocaleString?.() || 0} plays</span>
                                    </button>
                                ))}
                                {!artist.songs?.length && (
                                    <div className="public-epk-empty">No public tracks added yet.</div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="public-epk-side">
                        <section className="card public-epk-card">
                            <div className="public-epk-card-title">Artist Snapshot</div>
                            <div className="public-epk-side-line"><Music2 size={15} /> {primaryArtistType}</div>
                            {locationLabel && <div className="public-epk-side-line"><MapPin size={15} /> {locationLabel}</div>}
                            {artist.followerCount !== undefined && (
                                <div className="public-epk-side-line"><Globe size={15} /> {artist.followerCount.toLocaleString()} followers</div>
                            )}
                            {artist.genre && <div className="public-epk-side-line"><Share2 size={15} /> {artist.genre}</div>}
                        </section>

                        <section className="card public-epk-card">
                            <div className="public-epk-card-title">Actions</div>
                            {previewTrack && (
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={() => playTrack({
                                        id: previewTrack.id,
                                        title: previewTrack.title,
                                        artist: artist.name,
                                        artUrl: previewTrack.artUrl,
                                        audioUrl: previewTrack.audioUrl,
                                    })}
                                    style={{ justifyContent: 'center', marginBottom: 10 }}
                                    type="button"
                                >
                                    <Play size={16} /> Play Music
                                </button>
                            )}
                            {isOwner && (
                                <Link href="/dashboard/epk" className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>
                                    Edit EPK
                                </Link>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
        </motion.div>
    );
}

