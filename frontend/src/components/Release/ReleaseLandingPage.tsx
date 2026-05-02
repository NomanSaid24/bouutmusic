'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgeHelp,
  Check,
  ChevronRight,
  CircleCheckBig,
  CloudUpload,
  Crown,
  Disc3,
  Globe2,
  Rocket,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './ReleaseLandingPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ReleasePlan = {
  id: 'single' | 'pro' | 'premium';
  title: string;
  price: number;
  label: string;
  badge?: string;
  summary: string;
  bestFor: string;
  features: string[];
};

const releasePlans: ReleasePlan[] = [
  {
    id: 'single',
    title: 'Single Release',
    price: 499,
    label: 'Starter distribution',
    summary: 'Get your music live worldwide with the essentials handled cleanly.',
    bestFor: 'First-time releases',
    features: [
      'Get your music live worldwide',
      'Distribution to major platforms',
      'Spotify, Apple Music, YouTube Music, and more',
      'Artist profile setup (if new)',
      'Basic metadata setup',
      'YouTube Content ID',
      'Lifetime royalty collection setup',
    ],
  },
  {
    id: 'pro',
    title: 'Pro Release',
    price: 999,
    label: 'Best reach + value',
    badge: 'Most Popular',
    summary: 'Release with better discovery, faster handling, and stronger metadata.',
    bestFor: 'Serious independent artists',
    features: [
      'Release + better reach + discovery',
      'Everything in Single, plus',
      'Worldwide + all major Indian platforms',
      'Faster delivery',
      'Unlimited tracks',
      'Metadata optimization for discovery',
      'Release date planning support',
      'Basic pre-release guidance',
      'Optional Bouut promotion integration',
    ],
  },
  {
    id: 'premium',
    title: 'Premium Release',
    price: 1999,
    label: 'Strategy + visibility',
    summary: 'A more guided release path with visibility support and priority handling.',
    bestFor: 'Artists releasing professionally',
    features: [
      'Release + strategy + visibility support',
      'Everything in Pro, plus',
      'Pre-release strategy support',
      'Priority support & fast delivery',
      'Lyrics distribution',
      'Social media promotion assistance',
      'Caller tune distribution',
      'Publishing & copyright protection',
      'Priority placement for review/handling',
    ],
  },
];

const timeline = [
  { title: 'Choose plan', detail: 'Pick Single, Pro, or Premium based on release goals.' },
  { title: 'Pay securely', detail: 'Complete checkout through the existing PayU payment flow.' },
  { title: 'Upload release', detail: 'Your My Releases area unlocks after payment.' },
  { title: 'Go live', detail: 'Bouut handles delivery, metadata, and review support.' },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ReleaseLandingPage() {
  const router = useRouter();
  const { token, openAuthModal, isLoading: isAuthLoading } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<ReleasePlan['id']>('pro');
  const [submittingPlanId, setSubmittingPlanId] = useState<ReleasePlan['id'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = useMemo(
    () => releasePlans.find(plan => plan.id === selectedPlanId) || releasePlans[1],
    [selectedPlanId],
  );

  async function handleStartPlan(planId: ReleasePlan['id']) {
    setSelectedPlanId(planId);
    setError(null);

    if (!token) {
      openAuthModal('login', '/dashboard/release');
      return;
    }

    setSubmittingPlanId(planId);

    try {
      const response = await fetch(`${API_URL}/api/services/release/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const payload = await response.json().catch(() => null) as {
        redirectUrl?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.redirectUrl) {
        throw new Error(payload?.error || 'Unable to start release checkout.');
      }

      router.push(payload.redirectUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start release checkout.');
    } finally {
      setSubmittingPlanId(null);
    }
  }

  return (
    <div className={styles.releasePage}>
      <div className="breadcrumb">
        <Link href="/dashboard">Home</Link>
        <span>/</span>
        Release My Music
      </div>

      <section className={styles.releaseHero}>
        <div className={styles.releaseHeroCopy}>
          <span className={styles.releaseEyebrow}>
            <Globe2 size={15} />
            Bouut Distribution
          </span>
          <h1>Release your music worldwide with a launch path built for artists.</h1>
          <p>
            Pick a plan, complete PayU checkout, and unlock your release workspace so you can submit music
            for distribution with the right metadata, support, and visibility.
          </p>
          <div className={styles.releaseHeroActions}>
            <button
              type="button"
              className={styles.releasePrimaryButton}
              onClick={() => void handleStartPlan(selectedPlan.id)}
              disabled={isAuthLoading || submittingPlanId !== null}
            >
              {submittingPlanId ? 'Opening Checkout...' : `Start ${selectedPlan.title}`}
              <ChevronRight size={16} />
            </button>
            <Link href="/dashboard/release/my-releases" className={styles.releaseSecondaryButton}>
              View My Releases
            </Link>
          </div>
          {error && <div className={styles.releaseError}>{error}</div>}
        </div>

        <div className={styles.releaseHeroPanel}>
          <div className={styles.releasePanelTop}>
            <Disc3 size={30} />
            <div>
              <strong>150+ platforms</strong>
              <span>Spotify, Apple Music, YouTube Music, Indian DSPs, and more.</span>
            </div>
          </div>
          <div className={styles.releaseTimeline}>
            {timeline.map((item, index) => (
              <div key={item.title} className={styles.releaseTimelineItem}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.releaseTrustRail} aria-label="Release benefits">
        <div>
          <ShieldCheck size={18} />
          YouTube Content ID
        </div>
        <div>
          <CircleCheckBig size={18} />
          Lifetime royalty collection
        </div>
        <div>
          <Sparkles size={18} />
          Metadata optimization
        </div>
        <div>
          <CloudUpload size={18} />
          Upload unlock after payment
        </div>
      </section>

      <section className={styles.releasePricingSection}>
        <div className={styles.releaseSectionHeader}>
          <span className={styles.releaseMiniLabel}>Release plans</span>
          <h2>Choose how much support your release needs.</h2>
          <p>
            These are one-time release plans. After payment, the My Releases page unlocks and you can submit your music.
          </p>
        </div>

        <div className={styles.releasePlanGrid}>
          {releasePlans.map(plan => {
            const isSelected = selectedPlanId === plan.id;
            const isSubmitting = submittingPlanId === plan.id;

            return (
              <article
                key={plan.id}
                className={`${styles.releasePlanCard} ${plan.id === 'pro' ? styles.releasePlanPopular : ''} ${
                  isSelected ? styles.releasePlanSelected : ''
                }`}
              >
                {plan.badge && (
                  <div className={styles.releasePlanBadge}>
                    <Crown size={14} />
                    {plan.badge}
                  </div>
                )}
                <div className={styles.releasePlanHead}>
                  <span>{plan.label}</span>
                  <h3>{plan.title}</h3>
                  <p>{plan.summary}</p>
                </div>
                <div className={styles.releasePriceRow}>
                  <strong>{formatPrice(plan.price)}</strong>
                  <small>one-time</small>
                </div>
                <div className={styles.releaseBestFor}>
                  <BadgeHelp size={15} />
                  Best for: {plan.bestFor}
                </div>
                <ul className={styles.releaseFeatureList}>
                  {plan.features.map(feature => (
                    <li key={feature}>
                      <Check size={15} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={styles.releasePlanButton}
                  onClick={() => void handleStartPlan(plan.id)}
                  disabled={isAuthLoading || submittingPlanId !== null}
                >
                  {isSubmitting ? 'Preparing...' : `Choose ${plan.title}`}
                  <ChevronRight size={15} />
                </button>
              </article>
            );
          })}
        </div>

        <div className={styles.releaseChoiceNote}>
          <Rocket size={18} />
          <div>
            <strong>Not sure which plan to choose?</strong>
            <span>Most artists start with PRO RELEASE ({formatPrice(999)}) for best reach + value.</span>
          </div>
        </div>
      </section>

      <section className={styles.releaseUploadBand}>
        <div>
          <span className={styles.releaseMiniLabel}>After payment</span>
          <h2>Your release workspace opens automatically.</h2>
          <p>
            My Releases stays locked until a release plan is paid. Once unlocked, upload your audio,
            artwork, and track details from the release workspace.
          </p>
        </div>
        <Link href="/dashboard/release/my-releases" className={styles.releaseBandButton}>
          Go to My Releases
          <ChevronRight size={16} />
        </Link>
      </section>
    </div>
  );
}
