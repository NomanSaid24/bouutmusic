'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
    CirclePlus,
    Eye,
    Facebook,
    Image as ImageIcon,
    Instagram,
    Link as LinkIcon,
    MapPin,
    Music2,
    Pencil,
    Quote,
    Sparkles,
    Trophy,
    Video,
    Youtube,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatArtistLocation, getPrimaryArtistType } from '@/lib/profile';

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
}

function PlaceholderCard({
    title,
    buttonLabel,
    icon,
}: {
    title: string;
    buttonLabel: string;
    icon?: ReactNode;
}) {
    return (
        <section className="epk-showcase-section">
            <div className="epk-showcase-section-head">
                <h2>{title}</h2>
                <div className="epk-showcase-head-actions">
                    <Eye size={15} />
                    <Pencil size={15} />
                </div>
            </div>

            <div className="epk-showcase-placeholder">
                <div className="epk-showcase-plus">{icon || <CirclePlus size={16} />}</div>
                <p>Add the {title.toLowerCase()} you would like on your e-Press Kit</p>
                <button className="epk-showcase-add-btn" type="button">{buttonLabel}</button>
            </div>
        </section>
    );
}

export default function EPKEditorShowcasePage() {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const locationLabel = formatArtistLocation({
        country: user.country,
        state: user.state,
        city: user.city,
    }) || 'Add your location';

    const profileType = getPrimaryArtistType(user.artistTypes || []);
    const story = user.bio || 'Tell the world about your music journey';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="epk-showcase-page">
            <div className="epk-showcase-shell">
                <section className="epk-showcase-hero">
                    <div className="epk-showcase-banner">
                        {user.banner ? (
                            <img src={user.banner} alt="Banner" className="epk-showcase-banner-image" />
                        ) : (
                            <>
                                <div className="epk-showcase-banner-fill" />
                                <div className="epk-showcase-piano">
                                    <div className="epk-showcase-piano-keys" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="epk-showcase-profile-row">
                        <div className="epk-showcase-avatar-wrap">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="epk-showcase-avatar" />
                            ) : (
                                <div className="epk-showcase-avatar epk-showcase-avatar-fallback">{getInitials(user.name)}</div>
                            )}
                        </div>

                        <div className="epk-showcase-profile-copy">
                            <div className="epk-showcase-name-row">
                                <h1>{user.name}</h1>
                                <Pencil size={16} />
                            </div>
                            <div className="epk-showcase-meta-line">
                                <Music2 size={13} />
                                <span>{profileType}</span>
                            </div>
                            <div className="epk-showcase-meta-line">
                                <MapPin size={13} />
                                <span>{locationLabel}</span>
                            </div>
                        </div>

                        <div className="epk-showcase-socials">
                            <button type="button" aria-label="Instagram"><Instagram size={16} /></button>
                            <button type="button" aria-label="Facebook"><Facebook size={16} /></button>
                            <button type="button" aria-label="Spotify"><Sparkles size={16} /></button>
                            <button type="button" aria-label="YouTube"><Youtube size={16} /></button>
                            <button type="button" aria-label="Link"><LinkIcon size={16} /></button>
                        </div>
                    </div>
                </section>

                <section className="epk-showcase-section">
                    <div className="epk-showcase-section-head">
                        <h2>Story</h2>
                        <div className="epk-showcase-head-actions">
                            <Eye size={15} />
                            <Pencil size={15} />
                        </div>
                    </div>

                    <div className="epk-showcase-story-grid">
                        <div className="epk-showcase-story-copy">
                            <p className="epk-showcase-muted">{story}</p>

                            <div className="epk-showcase-story-group">
                                <h3>Performance Set</h3>
                                <ul>
                                    <li>Add your language</li>
                                    <li>Add your performance Set</li>
                                </ul>
                            </div>

                            <div className="epk-showcase-story-group">
                                <h3>Band Members</h3>
                                <ul>
                                    <li>Add Band Members</li>
                                </ul>
                            </div>
                        </div>

                        <div className="epk-showcase-story-art">
                            <div className="epk-showcase-story-art-inner">
                                <div className="epk-showcase-guitar" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="epk-showcase-section">
                    <div className="epk-showcase-section-head">
                        <h2>Achievements</h2>
                        <div className="epk-showcase-head-actions">
                            <Eye size={15} />
                            <Pencil size={15} />
                        </div>
                    </div>

                    <div className="epk-showcase-placeholder">
                        <div className="epk-showcase-plus"><Trophy size={15} /></div>
                        <p>Add the achievements you would like on your e-Press Kit</p>
                        <button className="epk-showcase-add-btn" type="button">Add Achievements</button>
                    </div>
                </section>

                <section className="epk-showcase-services">
                    <div className="epk-showcase-section-head epk-showcase-section-head-tight">
                        <div>
                            <h2>Receive Device and Services For</h2>
                            <p>Show how you want to collaborate with the world around you</p>
                        </div>
                        <div className="epk-showcase-head-actions">
                            <Eye size={15} />
                            <Pencil size={15} />
                        </div>
                    </div>

                    <div className="epk-showcase-service-pills">
                        <span>Live Gigs/events</span>
                        <span>Collaboration</span>
                        <span>Music Production</span>
                    </div>
                </section>

                <div className="epk-showcase-double-grid">
                    <PlaceholderCard title="Music" buttonLabel="Add Album" icon={<Music2 size={16} />} />
                    <PlaceholderCard title="Popular Tracks" buttonLabel="Add Tracks" icon={<Music2 size={16} />} />
                </div>

                <PlaceholderCard title="Video" buttonLabel="Add Videos" icon={<Video size={16} />} />
                <PlaceholderCard title="Photo" buttonLabel="Add Photos" icon={<ImageIcon size={16} />} />
                <PlaceholderCard title="Quote" buttonLabel="Add Quote" icon={<Quote size={16} />} />
                <PlaceholderCard title="Live Performances" buttonLabel="Add Live Performances" icon={<Sparkles size={16} />} />
                <PlaceholderCard title="In Press" buttonLabel="Add Featured Articles" icon={<Quote size={16} />} />

                <section className="epk-showcase-section">
                    <div className="epk-showcase-section-head">
                        <h2>Assets for download</h2>
                        <div className="epk-showcase-head-actions">
                            <Eye size={15} />
                            <Pencil size={15} />
                        </div>
                    </div>

                    <div className="epk-showcase-assets">
                        <button type="button">Logo</button>
                        <button type="button">Images</button>
                        <button type="button">Tech Rider</button>
                    </div>
                </section>
            </div>
        </motion.div>
    );
}
