'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Users, Music, Award,
    Settings, DollarSign, FileText, Bell, ClipboardList, RotateCcw, Star, MessageCircle
} from 'lucide-react';

interface AdminNavItem {
    label: string;
    href: string;
    icon: ReactNode;
}

const adminNav: { section: string; items: AdminNavItem[] }[] = [
    {
        section: 'Management',
        items: [
            { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={17} /> },
            { label: 'Users', href: '/admin/users', icon: <Users size={17} /> },
            { label: 'Support Inbox', href: '/admin/support', icon: <MessageCircle size={17} /> },
            { label: 'Roaster', href: '/admin/roaster', icon: <Star size={17} /> },
            { label: 'Songs Approval', href: '/admin/songs', icon: <Music size={17} /> },
            { label: 'Opportunities', href: '/admin/opportunities', icon: <Award size={17} /> },
        ],
    },
    {
        section: 'Commerce',
        items: [
            { label: 'Promo Submissions', href: '/admin/promo-submissions', icon: <ClipboardList size={17} /> },
            { label: 'Refund Queue', href: '/admin/refunds', icon: <RotateCcw size={17} /> },
            { label: 'Payments', href: '/admin/payments', icon: <DollarSign size={17} /> },
            { label: 'Payment Settings', href: '/admin/payment-settings', icon: <Settings size={17} /> },
        ],
    },
    {
        section: 'Content',
        items: [
            { label: 'Blog CMS', href: '/admin/blog', icon: <FileText size={17} /> },
            { label: 'Notifications', href: '/admin/notifications', icon: <Bell size={17} /> },
        ],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="admin-sidebar">
            <Link href="/admin" className="admin-sidebar-brand" aria-label="Bouut Admin Home">
                <img src="/logo-light.png" alt="Bouut Music" className="admin-sidebar-logo" />
                <div className="admin-sidebar-brand-text">
                    <span>Bouut</span>
                    <strong>Admin Console</strong>
                </div>
            </Link>

            <div className="admin-sidebar-scroll">
                {adminNav.map(section => (
                    <nav key={section.section} className="admin-sidebar-section" aria-label={section.section}>
                        <div className="admin-sidebar-section-label">{section.section}</div>
                        {section.items.map(item => {
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`admin-sidebar-link ${isActive ? 'is-active' : ''}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                ))}
            </div>
        </aside>
    );
}
