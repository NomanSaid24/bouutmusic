'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard, User, Star, Disc, BarChart2, DollarSign,
    Megaphone, Award, Tv, Globe, FileText, ChevronRight,
    Music, Headphones, TrendingUp, List, Play, BookOpen,
    Compass, Crown
} from 'lucide-react';

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    children?: { label: string; href: string; icon: React.ReactNode }[];
}

const loggedInNav: { section: string; items: NavItem[] }[] = [
    {
        section: 'WORKSTATION',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
            { label: 'e-Press Kit', href: '/dashboard/epk', icon: <User size={18} /> },
            { label: 'Pro Perks', href: '/dashboard/subscription', icon: <Star size={18} /> },
        ],
    },
    {
        section: 'DISTRIBUTION',
        items: [
            {
                label: 'Release',
                icon: <Disc size={18} />,
                children: [
                    { label: 'Create Release', href: '/dashboard/release/create', icon: <Play size={14} /> },
                    { label: 'My Releases', href: '/dashboard/release', icon: <List size={14} /> },
                ],
            },
            { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart2 size={18} /> },
            {
                label: 'Finance',
                icon: <DollarSign size={18} />,
                children: [
                    { label: 'Revenue Report', href: '/dashboard/finance/reports', icon: <TrendingUp size={14} /> },
                    { label: 'Royalty Splits', href: '/dashboard/finance/royalties', icon: <DollarSign size={14} /> },
                ],
            },
        ],
    },
    {
        section: 'PROMOTION',
        items: [
            { label: 'Promo Tools', href: '/dashboard/promo-tools', icon: <Megaphone size={18} /> },
            {
                label: 'Opportunities',
                icon: <Award size={18} />,
                children: [
                    { label: 'All Opportunities', href: '/dashboard/opportunities', icon: <Globe size={14} /> },
                    { label: 'My Applications', href: '/dashboard/opportunities/my', icon: <List size={14} /> },
                ],
            },
            { label: 'Broadcast on TV', href: '/dashboard/broadcast', icon: <Tv size={18} /> },
        ],
    },
    {
        section: 'EXPLORE',
        items: [
            { label: 'Songdew TV', href: '/videos', icon: <Tv size={18} /> },
            { label: 'Blogs', href: '/blogs', icon: <BookOpen size={18} /> },
            {
                label: 'Discover',
                icon: <Compass size={18} />,
                children: [
                    { label: 'Songs', href: '/songs', icon: <Music size={14} /> },
                    { label: 'Artists', href: '/artists', icon: <Headphones size={14} /> },
                    { label: 'Charts', href: '/charts', icon: <TrendingUp size={14} /> },
                    { label: 'Playlists', href: '/playlists', icon: <List size={14} /> },
                ],
            },
        ],
    },
];

const publicNav: { section: string; items: NavItem[] }[] = [
    {
        section: 'WORKSTATION',
        items: [
            { label: 'Pro Perks', href: '/pro', icon: <Star size={18} /> },
        ],
    },
    {
        section: 'DISTRIBUTION',
        items: [
            { label: 'Release', href: '/dashboard/release', icon: <Disc size={18} /> },
        ],
    },
    {
        section: 'PROMOTION',
        items: [
            { label: 'Promo Tools', href: '/dashboard/promo-tools', icon: <Megaphone size={18} /> },
            { label: 'Opportunities', href: '/dashboard/opportunities', icon: <Award size={18} /> },
            { label: 'Broadcast on TV', href: '/dashboard/broadcast', icon: <Tv size={18} /> },
        ],
    },
    {
        section: 'EXPLORE',
        items: [
            { label: 'Songdew TV', href: '/videos', icon: <Tv size={18} /> },
            { label: 'Blogs', href: '/blogs', icon: <BookOpen size={18} /> },
            {
                label: 'Discover',
                icon: <Compass size={18} />,
                children: [
                    { label: 'Songs', href: '/songs', icon: <Music size={14} /> },
                    { label: 'Artists', href: '/artists', icon: <Headphones size={14} /> },
                    { label: 'Charts', href: '/charts', icon: <TrendingUp size={14} /> },
                    { label: 'Playlists', href: '/playlists', icon: <List size={14} /> },
                ],
            },
        ],
    },
];

function NavItemComp({ item }: { item: NavItem }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(item.children?.some(c => c.href === pathname) ?? false);
    const isActive = item.href ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')) : false;

    if (item.children) {
        return (
            <div>
                <div className={`sidebar-item ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}>
                    {item.icon}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
                </div>
                {open && item.children.map(child => (
                    <Link key={child.href} href={child.href} className={`sidebar-sub-item ${pathname === child.href ? 'active' : ''}`}>
                        {child.icon}
                        {child.label}
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <Link href={item.href!} className={`sidebar-item ${isActive ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
        </Link>
    );
}

export function Sidebar() {
    // Using mock logged-in state for demo
    const isLoggedIn = true;
    const nav = isLoggedIn ? loggedInNav : publicNav;

    return (
        <aside className="app-sidebar">
            <div className="sidebar-waves sidebar-waves-top" />
            
            {/* Logo */}
            <Link href="/" className="sidebar-logo">
                <div>
                    <img 
                        src="/logo-light.png" 
                        alt="Bouut Music" 
                        style={{ maxWidth: '110px', height: 'auto', display: 'block' }}
                    />
                </div>
            </Link>

            {/* Upgrade Now */}
            {isLoggedIn && (
                <Link href="/dashboard/subscription" className="sidebar-upgrade">
                    <Crown size={16} />
                    Upgrade Now
                </Link>
            )}

            {/* Navigation */}
            <div className="flex-1 py-4">
                {nav.map((section, idx) => (
                    <div key={idx} className="mb-6">
                        <div className="sidebar-section-label">{section.section}</div>
                        {section.items.map((item, itemIdx) => (
                            <NavItemComp key={itemIdx} item={item} />
                        ))}
                    </div>
                ))}
            </div>

            <div className="sidebar-waves sidebar-waves-bottom" />
        </aside>
    );
}
