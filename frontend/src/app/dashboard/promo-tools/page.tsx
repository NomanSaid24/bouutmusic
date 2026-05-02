'use client';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    CheckCircle2,
    Headphones,
    ListMusic,
    Megaphone,
    Rocket,
    Sparkles,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';
import { getVisiblePromoServices, type StaticPromoService } from '@/lib/staticPromoServices';

type PromoToolCard = StaticPromoService & {
    href: string;
    eyebrow: string;
    ctaLabel: string;
    priceLabel?: string;
    icon: LucideIcon;
    accent: string;
    accentSoft: string;
};

const serviceMeta: Record<string, Omit<PromoToolCard, keyof StaticPromoService | 'href'>> = {
    'Submit my demo': {
        eyebrow: 'A&R Review',
        ctaLabel: 'Submit Demo',
        icon: Headphones,
        accent: '#ff6b6d',
        accentSoft: 'rgba(255, 107, 109, 0.24)',
    },
    'Get playlisted': {
        eyebrow: 'Playlist Pitch',
        ctaLabel: 'Start Pitch',
        icon: ListMusic,
        accent: '#7dd3fc',
        accentSoft: 'rgba(125, 211, 252, 0.2)',
    },
    'Promote your music': {
        eyebrow: 'Campaigns',
        ctaLabel: 'View Plans',
        priceLabel: 'From ₹299',
        icon: Megaphone,
        accent: '#fbbf24',
        accentSoft: 'rgba(251, 191, 36, 0.22)',
    },
};

const growthEngineCard: PromoToolCard = {
    id: 'growth-engine',
    name: 'Join Growth Engine',
    description: 'Enter a guided artist growth program built for audience strategy, campaign planning, and long-term momentum.',
    price: 0,
    priceLabel: 'From ₹1,499/mo',
    features: ['Weekly promo rhythm', 'Campaign planning', 'Spotlight access'],
    href: '/dashboard/growth-engine',
    eyebrow: 'Artist Growth',
    ctaLabel: 'Join Now',
    icon: TrendingUp,
    accent: '#a78bfa',
    accentSoft: 'rgba(167, 139, 250, 0.24)',
};

export default function PromoToolsPage() {
    const services = getVisiblePromoServices();
    const getServiceHref = (serviceId: string) => (
        serviceId === 'cmnd249d0003zuy8o1zicok20'
            ? '/dashboard/promo-tools/promoteyourmusic/pricing'
            : `/dashboard/promo-tools/${serviceId}`
    );

    const cards: PromoToolCard[] = [
        ...services.map(service => ({
            ...service,
            href: getServiceHref(service.id),
            ...(serviceMeta[service.name] || {
                eyebrow: 'Promo Tool',
                ctaLabel: 'Open Tool',
                icon: Rocket,
                accent: '#e96061',
                accentSoft: 'rgba(233, 96, 97, 0.22)',
            }),
        })),
        growthEngineCard,
    ];

    const formatPrice = (card: PromoToolCard) => {
        if (card.priceLabel) {
            return card.priceLabel;
        }

        return card.price === 0 ? 'Free' : `\u20b9${card.price.toLocaleString('en-IN')}`;
    };

    return (
        <div className="promo-tools-page">
            <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span> Promote</div>
            <div className="page-header promo-tools-header">
                <div>
                    <div className="promo-tools-kicker"><Sparkles size={14} /> Artist toolkit</div>
                    <h1 className="page-title">Promo Tools & Services</h1>
                    <p className="text-gray-500 mt-2">Grow your music career with professional promotion tools, playlist support, and guided artist development.</p>
                </div>
            </div>

            <div className="promo-tools-grid">
                {cards.map(card => {
                    const Icon = card.icon;

                    return (
                        <Link
                            key={card.id}
                            href={card.href}
                            className="promo-tool-card"
                            style={{
                                '--promo-accent': card.accent,
                                '--promo-accent-soft': card.accentSoft,
                            } as CSSProperties}
                            aria-label={`${card.name}: ${card.ctaLabel}`}
                        >
                            <div className="promo-tool-card-head">
                                <span className="promo-tool-icon">
                                    <Icon size={24} />
                                </span>
                                <span className="promo-tool-eyebrow">{card.eyebrow}</span>
                            </div>

                            <div className="promo-tool-card-copy">
                                <h2>{card.name}</h2>
                                <p>{card.description}</p>
                            </div>

                            <div className="promo-tool-features">
                                {card.features.slice(0, 3).map(feature => (
                                    <span key={feature}>
                                        <CheckCircle2 size={15} />
                                        {feature}
                                    </span>
                                ))}
                            </div>

                            <div className="promo-tool-footer">
                                <span className="promo-tool-price">
                                    <small>Access</small>
                                    <strong>{formatPrice(card)}</strong>
                                </span>
                                <span className="promo-tool-cta">
                                    {card.ctaLabel}
                                    <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

