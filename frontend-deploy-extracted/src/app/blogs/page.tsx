'use client';
import Link from 'next/link';
import { useState } from 'react';

const POSTS = [
    { slug: 'promote-music-social-media-2026', title: 'How to Promote Your Music on Social Media in 2026', excerpt: 'Learn the best strategies to grow your fanbase and promote your music effectively on Instagram, YouTube, and TikTok.', tags: ['marketing', 'social media', 'tips'], date: 'Feb 15, 2026', coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop', author: 'Bouut Admin' },
    { slug: 'music-royalties-beginners-guide', title: "Understanding Music Royalties: A Beginner's Guide", excerpt: 'Everything independent artists need to know about publishing royalties, performance rights, and how to collect what you\'re owed.', tags: ['royalties', 'business'], date: 'Feb 28, 2026', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=300&fit=crop', author: 'Bouut Admin' },
    { slug: 'home-recording-studio-setup-tips', title: 'Top 10 Home Recording Studio Setup Tips', excerpt: "Build a professional-quality home recording studio without breaking the bank. Essential gear and acoustic treatment advice.", tags: ['recording', 'studio', 'gear'], date: 'Mar 5, 2026', coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=300&fit=crop', author: 'Bouut Admin' },
    { slug: 'artist-spotlight-raza-khan', title: "Artist Spotlight: Raza Khan's Journey into Sufi Music", excerpt: 'We sit down with Raza Khan to discuss his journey from classical training to modern Sufi fusion.', tags: ['artist spotlight', 'sufi', 'interview'], date: 'Mar 8, 2026', coverImage: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=300&fit=crop', author: 'Bouut Admin' },
];

export default function BlogsPage() {
    return (
        <div>
            <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Blogs</div>
            <div className="page-header"><h1 className="page-title">Blog</h1></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                {POSTS.map(post => (
                    <Link key={post.slug} href={`/blogs/${post.slug}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                                {post.tags.map(t => <span key={t} className="badge badge-blue">{t}</span>)}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, lineHeight: 1.4 }}>{post.title}</div>
                            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 12 }}>{post.excerpt}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{post.author} · {post.date}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
