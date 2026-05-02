'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Flame,
  Info,
  Megaphone,
  Radio,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type GrowthFeature = {
  label: string;
  detail: string;
};

type GrowthPlan = {
  id: 'basic' | 'pro';
  name: string;
  price: number;
  badge?: string;
  description: string;
  highlight: string;
  features: GrowthFeature[];
};

const plans: GrowthPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 1499,
    description: 'A steady monthly content engine for artists who want consistent visibility.',
    highlight: 'Weekly momentum',
    features: [
      { label: '1 Reel per week (4/month)', detail: 'Four short-form video pushes each month for ongoing audience reach.' },
      { label: '1 Feed post per week', detail: 'A weekly permanent post to keep your release, profile, or campaign visible.' },
      { label: '3-5 Stories per week', detail: 'Frequent story placements for reminders, drops, snippets, and fan touchpoints.' },
      { label: 'Friday Spotlight access', detail: 'Eligibility for Friday discovery placement when your campaign fits the editorial slot.' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2999,
    badge: 'Most Popular',
    description: 'A high-pressure growth lane with more placements, planning, and priority attention.',
    highlight: 'Aggressive campaign support',
    features: [
      { label: '2 Reels per week (8/month)', detail: 'Twice-weekly short-form pushes for stronger campaign frequency.' },
      { label: '2 Feed posts per week', detail: 'Two weekly permanent feed placements to build repeated visibility.' },
      { label: 'Daily Story promotion', detail: 'Daily story activity for consistent reminders, social proof, and release movement.' },
      { label: 'Priority posting', detail: 'Your campaign gets scheduling priority when the promotion calendar is busy.' },
      { label: 'Highlight feature included', detail: 'Selected campaign assets can live in highlights for longer discovery.' },
      { label: 'Pre-release hype included', detail: 'Build attention before launch with teaser and countdown-style promotion.' },
      { label: 'Dedicated attention', detail: 'More focused review and campaign handling from the Bouut team.' },
      { label: 'Campaign planning', detail: 'A clearer monthly promotion direction built around your goals and release timing.' },
      { label: 'Aggressive promotion', detail: 'Higher frequency campaign pressure across available Bouut promotion surfaces.' },
      { label: 'Friday Spotlight access', detail: 'Eligibility for Friday discovery placement when your campaign fits the editorial slot.' },
      { label: 'Weekly top picks access', detail: 'Eligibility for weekly top-picks discovery when your music fits the slot.' },
    ],
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function GrowthEnginePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<GrowthPlan['id'] | null>(null);
  const [error, setError] = useState('');

  const proPlan = useMemo(() => plans.find(plan => plan.id === 'pro')!, []);

  async function handleSelectPlan(planId: GrowthPlan['id']) {
    if (!token) {
      setError('Please sign in again before choosing a Growth Engine plan.');
      return;
    }

    setSelectedPlan(planId);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/services/growth-engine/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const payload = await response.json().catch(() => null) as { redirectUrl?: string; error?: string } | null;

      if (!response.ok || !payload?.redirectUrl) {
        throw new Error(payload?.error || 'Unable to start Growth Engine checkout.');
      }

      router.push(payload.redirectUrl);
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : 'Unable to start Growth Engine checkout.');
      setSelectedPlan(null);
    }
  }

  return (
    <div className="growth-engine-page">
      <div className="breadcrumb">
        <Link href="/dashboard">Home</Link>
        <span>/</span>
        <span>Growth Engine</span>
      </div>

      <section className="growth-hero">
        <div className="growth-hero-copy">
          <span className="growth-kicker"><Sparkles size={15} /> Monthly artist growth</span>
          <h1>Join Growth Engine</h1>
          <p>
            Turn promotion into a monthly rhythm with planned reels, feed posts, stories,
            discovery placements, and campaign direction from Bouut Music.
          </p>
          <div className="growth-hero-actions">
            <button type="button" onClick={() => void handleSelectPlan('pro')} disabled={!!selectedPlan}>
              {selectedPlan === 'pro' ? 'Preparing checkout...' : 'Start Pro Plan'}
              <ArrowRight size={17} />
            </button>
            <a href="#growth-plans">Compare Plans</a>
          </div>
        </div>

        <div className="growth-command-panel" aria-label="Growth Engine preview">
          <div className="growth-command-top">
            <span>Campaign Pulse</span>
            <strong>{formatCurrency(proPlan.price)}/mo</strong>
          </div>
          <div className="growth-signal-grid">
            <span><Flame size={18} /> Aggressive promotion</span>
            <span><CalendarClock size={18} /> Daily story push</span>
            <span><Target size={18} /> Campaign planning</span>
            <span><Radio size={18} /> Spotlight access</span>
          </div>
          <div className="growth-pulse-bars" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="growth-stats" aria-label="Growth Engine focus areas">
        <div>
          <Megaphone size={20} />
          <span>Promotion</span>
          <strong>Weekly</strong>
        </div>
        <div>
          <BarChart3 size={20} />
          <span>Planning</span>
          <strong>Monthly</strong>
        </div>
        <div>
          <Zap size={20} />
          <span>Momentum</span>
          <strong>Always-on</strong>
        </div>
      </section>

      <section id="growth-plans" className="growth-plan-section">
        <div className="growth-section-head">
          <span className="growth-kicker">Pricing</span>
          <h2>Choose your monthly engine</h2>
          <p>Both plans route into PayU checkout through the same payment system already used by Bouut promo services.</p>
        </div>

        {error ? <div className="growth-error">{error}</div> : null}

        <div className="growth-plan-grid">
          {plans.map(plan => (
            <article key={plan.id} className={`growth-plan-card ${plan.id === 'pro' ? 'is-featured' : ''}`}>
              {plan.badge ? <div className="growth-plan-badge">{plan.badge}</div> : null}
              <div className="growth-plan-head">
                <span>{plan.highlight}</span>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>
              <div className="growth-plan-price">
                <strong>{formatCurrency(plan.price)}</strong>
                <span>/month</span>
              </div>
              <div className="growth-feature-list">
                {plan.features.map(feature => (
                  <div key={feature.label} className="growth-feature-row">
                    <CheckCircle2 size={17} />
                    <span>{feature.label}</span>
                    <button type="button" className="growth-info-button" aria-label={`About ${feature.label}`}>
                      <Info size={14} />
                      <span className="growth-tooltip">{feature.detail}</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="growth-plan-cta"
                onClick={() => void handleSelectPlan(plan.id)}
                disabled={!!selectedPlan}
              >
                {selectedPlan === plan.id ? 'Preparing checkout...' : `Choose ${plan.name}`}
                <ArrowRight size={17} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
