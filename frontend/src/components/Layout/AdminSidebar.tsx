'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Users, Music, Award, 
    Settings, DollarSign, FileText, Bell 
} from 'lucide-react';

const adminNav = [
    { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={16} /> },
    { label: 'Users', href: '/admin/users', icon: <Users size={16} /> },
    { label: 'Songs Approval', href: '/admin/songs', icon: <Music size={16} /> },
    { label: 'Opportunities', href: '/admin/opportunities', icon: <Award size={16} /> },
    { label: 'Services & Pricing', href: '/admin/services', icon: <Settings size={16} /> },
    { label: 'Payments', href: '/admin/payments', icon: <DollarSign size={16} /> },
    { label: 'Blog CMS', href: '/admin/blog', icon: <FileText size={16} /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <Bell size={16} /> },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="app-sidebar" style={{ background: '#111827', color: 'white', borderRight: 'none' }}>
            {/* Logo */}
            <Link href="/" className="sidebar-logo">
                <div className="sidebar-logo-box" style={{ background: 'var(--primary)', color: 'white' }}>
                    b<span>O</span>UUT<br />
                    <span style={{ fontSize: '11px', letterSpacing: '1px' }}>ADMIN</span>
                </div>
            </Link>

            {/* Navigation */}
            <div style={{ marginTop: 24 }}>
                <div className="sidebar-section-label" style={{ color: '#6b7280' }}>MANAGEMENT</div>
                {adminNav.map(item => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                        <Link 
                            key={item.label} 
                            href={item.href} 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', 
                                color: isActive ? 'white' : '#9ca3af',
                                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: '0.2s'
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </aside>
    );
}
