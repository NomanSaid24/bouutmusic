'use client';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

const POSTS = [
    { id: 1, title: 'How to distribute your music independently in 2026', author: 'Team Bouut', date: 'Mar 10, 2026', status: 'Published', views: '1,240' },
    { id: 2, title: 'Top 5 mistakes upcoming artists make', author: 'Aryan K', date: 'Mar 08, 2026', status: 'Published', views: '2,890' },
    { id: 3, title: 'Understanding Royalty Splits on Streaming Platforms', author: 'Legal Team', date: 'Mar 15, 2026', status: 'Draft', views: '-' },
    { id: 4, title: 'Artist Spotlight: The Rise of Indie Pop', author: 'Team Bouut', date: 'Feb 28, 2026', status: 'Published', views: '4,100' },
];

export default function AdminBlogPage() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Blog CMS</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Write, edit, and publish articles to the Bouut Blog</div>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={18} /> New Post</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Post Title</th>
                                <th>Author</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Views</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {POSTS.map(post => (
                                <tr key={post.id}>
                                    <td style={{ fontWeight: 600, color: '#111827' }}>{post.title}</td>
                                    <td style={{ color: '#6b7280' }}>{post.author}</td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>{post.date}</td>
                                    <td><span className={`badge badge-${post.status === 'Published' ? 'green' : 'gray'}`}>{post.status}</span></td>
                                    <td style={{ fontWeight: 600 }}>{post.views}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}><Eye size={16} color="#6b7280" /></button>
                                            <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}><Edit2 size={16} color="#6b7280" /></button>
                                            <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}><Trash2 size={16} color="#ef4444" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
