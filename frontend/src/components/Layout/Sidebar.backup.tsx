'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart2,
    BookOpen,
    ChevronRight,
    Compass,
    Disc,
    DollarSign,
    Headphones,
    LayoutDashboard,
    List,
    Megaphone,
    Play,
    TrendingUp,
    User,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

type AuthMode = 'login' | 'register';

interface NavLinkItem {
    label: string;
    href: string;
    icon: ReactNode;
    requiresAuth?: boolean;
    authMode?: AuthMode;
}

interface NavItem {
    label: string;
    href?: string;
    icon: ReactNode;
    requiresAuth?: boolean;
    authMode?: AuthMode;
    children?: NavLinkItem[];
}

const memberNav: { section: string; items: NavItem[] }[] = [
    {
        section: 'WORKSTATION',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, requiresAuth: true },
            { label: 'E-Profile', href: '/dashboard/epk', icon: <User size={18} />, requiresAuth: true },
        ],
    },
    {
        section: 'DISTRIBUTION',
        items: [
            {
                label: 'Release',
                icon: <Disc size={18} />,
                children: [
                    { label: 'Create Release', href: '/dashboard/release', icon: <Play size={14} />, requiresAuth: true },
                    { label: 'My Releases', href: '/dashboard/release/my-releases', icon: <List size={14} />, requiresAuth: true },
                ],
            },
            { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart2 size={18} />, requiresAuth: true },
            {
                label: 'Finance',
                icon: <DollarSign size={18} />,
                children: [
                    { label: 'Revenue Report', href: '/dashboard/finance', icon: <TrendingUp size={14} />, requiresAuth: true },
                    { label: 'Royalty Splits', href: '/dashboard/finance', icon: <DollarSign size={14} />, requiresAuth: true },
                ],
            },
        ],
    },
    {
        section: 'PROMOTION',
        items: [
            { label: 'Promo Tools', href: '/dashboard/promo-tools', icon: <Megaphone size={18} />, requiresAuth: true },
        ],
    },
    {
        section: 'EXPLORE',
        items: [
            { label: 'Blogs', href: '/blogs', icon: <BookOpen size={18} /> },
            {
                label: 'Discover',
                icon: <Compass size={18} />,
                children: [
                    { label: 'Playlists', href: '/playlists', icon: <List size={14} /> },
                    { label: 'Roaster', href: '/roaster', icon: <Headphones size={14} /> },
                ],
            },
        ],
    },
];

const publicNav: { section: string; items: NavItem[] }[] = [
    {
        section: 'DISTRIBUTION',
        items: [
            {
                label: 'Release',
                icon: <Disc size={18} />,
                children: [
                    { label: 'Create Release', href: '/dashboard/release', icon: <Play size={14} />, requiresAuth: true, authMode: 'register' },
                ],
            },
        ],
    },
    {
        section: 'PROMOTION',
        items: [
            { label: 'Promo Tools', href: '/dashboard/promo-tools', icon: <Megaphone size={18} />, requiresAuth: true },
        ],
    },
    {
        section: 'EXPLORE',
        items: [
            { label: 'Blogs', href: '/blogs', icon: <BookOpen size={18} /> },
            {
                label: 'Discover',
                icon: <Compass size={18} />,
                children: [
                    { label: 'Playlists', href: '/playlists', icon: <List size={14} /> },
                    { label: 'Roaster', href: '/roaster', icon: <Headphones size={14} /> },
                ],
            },
        ],
    },
];

function SidebarAction({
    item,
    className,
    isActive,
}: {
    item: NavLinkItem | NavItem;
    className: string;
    isActive?: boolean;
}) {
    const { isAuthenticated, openAuthModal } = useAuth();

    return (
        <Link
            href={item.href!}
            className={`${className} ${isActive ? 'active' : ''}`}
            onClick={event => {
                if (item.requiresAuth && !isAuthenticated) {
                    event.preventDefault();
                    openAuthModal(item.authMode || 'login', item.href);
                }
            }}
        >
            {item.icon}
            <span>{item.label}</span>
        </Link>
    );
}

function NavItemComp({ item }: { item: NavItem }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(item.children?.some(child => child.href === pathname) ?? false);
    const isActive = item.href ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')) : false;

    if (item.children) {
        return (
            <div>
                <div className={`sidebar-item ${open ? 'active' : ''}`} onClick={() => setOpen(current => !current)}>
                    {item.icon}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
                </div>
                {open && item.children.map(child => (
                    <SidebarAction
                        key={`${item.label}-${child.label}`}
                        item={child}
                        className="sidebar-sub-item"
                        isActive={pathname === child.href}
                    />
                ))}
            </div>
        );
    }

    return <SidebarAction item={item} className="sidebar-item" isActive={isActive} />;
}

export function Sidebar() {
    const { isAuthenticated } = useAuth();
    const nav = isAuthenticated ? memberNav : publicNav;

    return (
        <aside className="app-sidebar">
            <div className="sidebar-waves sidebar-waves-top" />

            <Link href="/" className="sidebar-logo">
                <div>
                    <img
                        src="/logo-light.png"
                        alt="Bouut Music"
                        style={{ maxWidth: '110px', height: 'auto', display: 'block' }}
                    />
                </div>
            </Link>

            <div className="flex-1 py-4">
                {nav.map(section => (
                    <div key={section.section} className="mb-6">
                        <div className="sidebar-section-label">{section.section}</div>
                        {section.items.map(item => (
                            <NavItemComp key={`${section.section}-${item.label}`} item={item} />
                        ))}
                    </div>
                ))}
            </div>

            <div className="sidebar-waves sidebar-waves-bottom" />
        </aside>
    );
}
