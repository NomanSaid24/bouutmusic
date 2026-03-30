'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Coins,
  Globe2,
  Megaphone,
  Play,
  Radio,
  Sparkles,
  Tv,
  Users2,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const communityFaces = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face',
];

const distributionCards = [
  {
    icon: <Globe2 size={18} />,
    title: 'Think Worldwide',
    description: 'Take your music to global streaming platforms, digital stores, and curated catalog destinations from one place.',
  },
  {
    icon: <Coins size={18} />,
    title: 'Make Your Music Make Money The Right Way',
    description: 'Collect royalties, keep your release data organized, and build a cleaner revenue engine for every drop.',
  },
  {
    icon: <Megaphone size={18} />,
    title: 'Powerful Promotion Tools',
    description: 'Push every release further with promo support, editorial opportunities, and better visibility across the platform.',
  },
];

const promotionCards = [
  {
    step: '1',
    title: 'Bouut TV',
    description: 'Pitch videos, unlock platform exposure, and move your release into a more visible broadcast lane.',
  },
  {
    step: '2',
    title: 'Radio Broadcast',
    description: 'Create a stronger release run with opportunities tailored for radio-ready music and discovery.',
  },
  {
    step: '3',
    title: 'Promotional Boost',
    description: 'Launch better campaigns with smarter placement, stronger momentum, and cleaner storytelling.',
  },
  {
    step: '4',
    title: 'Exclusive Digital Tools',
    description: 'Use platform-first tools that help you market releases with more confidence and control.',
  },
];

const moneyPoints = [
  {
    icon: <BadgeDollarSign size={18} />,
    title: 'Licensing With Brands',
    text: 'Open your music for sync-friendly placements and brand-facing opportunities designed for independent artists.',
  },
  {
    icon: <BriefcaseBusiness size={18} />,
    title: 'Production Opportunities',
    text: 'Find partnerships and commissioned work that can turn your catalog into recurring income.',
  },
  {
    icon: <Radio size={18} />,
    title: 'Live Performances',
    text: 'Get closer to event organizers and performance opportunities that increase both reach and revenue.',
  },
];

const growthPoints = [
  'Build stronger momentum around every release with promotion, distribution, and monetization working together.',
  'Reach your audience with smarter campaigns and get discovered by curators, brands, and partners faster.',
  'Stay in control of your growth and understand what is working with practical data and artist-first tools.',
  'Get access to opportunities that can push your music into playlists, publications, live stages, and media.',
  'Keep your workflow simple with one connected system built to help independent artists move forward.',
];

const closingCtas = [
  {
    eyebrow: 'The Heart Of Bouut',
    title: 'Experience The Power Of Music Business Administration',
    text: 'Distribute, promote, and monetize all in one place.',
    action: 'Be Part Of Bouut',
  },
  {
    eyebrow: 'Built For Independent Artists',
    title: 'Experience The Power Of Music Business Administration',
    text: 'Visibility, revenue, and momentum in one clean system.',
    action: 'Upgrade to Pro',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

function PrimaryHeroAction({
  isAuthenticated,
  openAuthModal,
}: {
  isAuthenticated: boolean;
  openAuthModal: (mode?: 'login' | 'register', redirectTo?: string) => void;
}) {
  if (isAuthenticated) {
    return (
      <Link href="/dashboard" className="landing-primary-btn">
        Open Dashboard
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="landing-primary-btn"
      onClick={() => openAuthModal('register', '/dashboard')}
    >
      Upgrade to Pro
    </button>
  );
}

export default function HomePage() {
  const { isAuthenticated, openAuthModal } = useAuth();

  return (
    <motion.div className="landing-page" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.section className="landing-hero" variants={sectionVariants}>
        <div className="landing-hero-copy">
          <span className="landing-kicker">The Power Of</span>
          <h1 className="landing-hero-title">Music Business Administration</h1>
          <p className="landing-hero-description">
            Put your music career on the fast lane. <strong>Promote, distribute</strong> and <strong>monetize</strong>
            {' '}with Bouut Music in one connected workspace.
          </p>

          <div className="landing-hero-actions">
            <PrimaryHeroAction isAuthenticated={isAuthenticated} openAuthModal={openAuthModal} />
            <Link href="/dashboard/subscription" className="landing-secondary-link">
              Explore Pro
            </Link>
          </div>

          <div className="landing-community">
            <div className="landing-avatar-stack">
              {communityFaces.map(face => (
                <img key={face} src={face} alt="Bouut artist" className="landing-avatar" />
              ))}
              <div className="landing-avatar-badge">70K+</div>
            </div>
            <span className="landing-community-text">Artists trust us</span>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="landing-poster-card">
            <div className="landing-wave-pill" />
            <img
              src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900&h=1100&fit=crop"
              alt="Bouut featured artist"
              className="landing-poster-image"
            />
            <div className="landing-poster-badge">
              <span>The Music Business Administrators</span>
              <strong>Bouut Music</strong>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section className="landing-section-block" variants={sectionVariants}>
        <div className="landing-section-header">
          <div>
            <p className="landing-section-eyebrow">Bouut Rocks</p>
            <h2 className="landing-section-title">Distribution</h2>
          </div>
          <p className="landing-section-intro">
            Release with confidence, stay organized, and keep every track working harder across stores and streaming services.
          </p>
        </div>

        <div className="landing-distribution-grid">
          {distributionCards.map(card => (
            <article key={card.title} className="landing-info-card">
              <div className="landing-info-icon">{card.icon}</div>
              <h3 className="landing-info-title">{card.title}</h3>
              <p className="landing-info-description">{card.description}</p>
            </article>
          ))}
        </div>

        <div className="landing-section-action">
          <Link href="/dashboard/release" className="landing-link-btn">
            Distribute Music
          </Link>
        </div>
      </motion.section>

      <motion.section className="landing-two-column landing-two-column-promo" variants={sectionVariants}>
        <div className="landing-column-copy">
          <p className="landing-section-eyebrow">Bouut Rocks</p>
          <h2 className="landing-section-title">Promotion</h2>
          <p className="landing-section-intro landing-section-intro-left">
            Turn releases into bigger moments and give your music more ways to travel through media, promo, and discovery surfaces.
          </p>

          <div className="landing-number-grid">
            {promotionCards.map(card => (
              <article key={card.title} className="landing-number-card">
                <div className="landing-number-badge">{card.step}</div>
                <h3 className="landing-number-title">{card.title}</h3>
                <p className="landing-number-description">{card.description}</p>
              </article>
            ))}
          </div>

          <div className="landing-section-action landing-section-action-left">
            <Link href="/dashboard/promo-tools" className="landing-link-btn">
              Promote Your Music
            </Link>
          </div>
        </div>

        <div className="landing-visual-panel landing-visual-panel-blue">
          <div className="landing-visual-chip">
            <Sparkles size={16} />
            <span>Promotion</span>
          </div>
          <div className="landing-visual-frame landing-visual-frame-right">
            <img
              src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&h=1100&fit=crop"
              alt="Bouut promotion visual"
              className="landing-visual-image"
            />
          </div>
        </div>
      </motion.section>

      <motion.section className="landing-two-column landing-two-column-money" variants={sectionVariants}>
        <div className="landing-visual-panel landing-visual-panel-indigo">
          <div className="landing-visual-chip">
            <Coins size={16} />
            <span>Monetize</span>
          </div>
          <div className="landing-visual-frame landing-visual-frame-left">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1100&fit=crop"
              alt="Bouut monetization visual"
              className="landing-visual-image"
            />
          </div>
        </div>

        <div className="landing-list-panel">
          <h2 className="landing-section-title">How To Make Your Music Make Money</h2>
          <div className="landing-list-stack">
            {moneyPoints.map(point => (
              <article key={point.title} className="landing-list-item">
                <div className="landing-list-icon">{point.icon}</div>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="landing-section-action landing-section-action-left">
            <Link href="/dashboard/opportunities" className="landing-link-btn">
              Explore Opportunities
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section className="landing-network-strip" variants={sectionVariants}>
        <div className="landing-network-inner">
          <Users2 size={18} />
          <span>Join A Network Of 70K+ Emerging And Major Artists</span>
        </div>
      </motion.section>

      <motion.section className="landing-two-column landing-two-column-growth" variants={sectionVariants}>
        <div className="landing-growth-panel">
          <h2 className="landing-section-title">Accelerate Your Music Career, Your Way</h2>
          <div className="landing-growth-list">
            {growthPoints.map((point, index) => (
              <article key={point} className="landing-growth-item">
                <div className="landing-growth-badge">{index + 1}</div>
                <p>{point}</p>
              </article>
            ))}
          </div>

          <div className="landing-section-action landing-section-action-left">
            <Link href="/dashboard" className="landing-link-btn">
              Elevate Your Music
            </Link>
          </div>
        </div>

        <div className="landing-visual-panel landing-visual-panel-gold">
          <div className="landing-visual-frame landing-visual-frame-offset">
            <img
              src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&h=1100&fit=crop"
              alt="Bouut artist guitar visual"
              className="landing-visual-image"
            />
          </div>
        </div>
      </motion.section>

      <motion.section className="landing-video-card" variants={sectionVariants}>
        <img
          src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1400&h=780&fit=crop"
          alt="Bouut video feature"
          className="landing-video-image"
        />
        <div className="landing-video-overlay" />
        <div className="landing-video-copy">
          <span className="landing-video-tag">Bouut | The Music Business Administrators</span>
          <h2>Born To Be Wildly Successful</h2>
          <p>One connected system for distributing, promoting, and monetizing your music.</p>
          <a
            href="https://www.youtube.com/@bouutmusic"
            target="_blank"
            rel="noreferrer"
            className="landing-video-play"
          >
            <Play size={18} fill="currentColor" />
          </a>
        </div>
      </motion.section>

      <motion.section className="landing-cta-stack" variants={sectionVariants}>
        {closingCtas.map(card => (
          <article key={card.action} className="landing-cta-card">
            <span className="landing-cta-eyebrow">{card.eyebrow}</span>
            <h2 className="landing-cta-title">{card.title}</h2>
            <p className="landing-cta-text">{card.text}</p>
            <button
              type="button"
              className="landing-cta-link"
              onClick={() => {
                if (isAuthenticated) {
                  window.location.href = '/dashboard';
                  return;
                }

                openAuthModal('register', '/dashboard');
              }}
            >
              {card.action} <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </motion.section>
    </motion.div>
  );
}
