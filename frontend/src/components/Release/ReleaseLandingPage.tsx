'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BadgeHelp,
  Check,
  ChevronRight,
  CircleCheckBig,
  CloudUpload,
  Crown,
  Disc3,
  Globe2,
  Sparkles,
  X,
} from 'lucide-react';
import styles from './ReleaseLandingPage.module.css';

type ChoiceCard = {
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  href: string;
  note?: string;
  icon: typeof Disc3;
  featured?: boolean;
};

type CompareCell = {
  primary: string;
  secondary?: string;
};

type CompareSection = {
  title: string;
  rows: {
    label: string;
    upload: CompareCell;
    release: CompareCell;
  }[];
};

const choiceCards: ChoiceCard[] = [
  {
    title: 'Release your music worldwide',
    description:
      'Put your release on 150+ streaming services and own a cleaner, more professional launch path.',
    bullets: ['Keep more of your royalties', 'Reach DSPs like Spotify, Apple Music and YouTube'],
    cta: 'Release Your Music',
    href: '#release-benefits',
    note: 'Best for official distribution',
    icon: Disc3,
    featured: true,
  },
  {
    title: 'Upload directly to Bouut',
    description:
      'Share old and new music inside the Bouut ecosystem and keep your profile fresh for industry stakeholders.',
    bullets: ['Keep your e-Press Kit active', 'Use Bouut promotion and discovery tools'],
    cta: 'Upload on Bouut',
    href: '#release-comparison',
    icon: CloudUpload,
  },
];

const distributionFeatures = [
  'Your music on 150+ global platforms like Spotify, Apple Music, Amazon Music and YouTube.',
  'Free delivery to future partner platforms as Bouut expands distribution reach.',
  'Monetization options including YouTube Content ID and social-platform support.',
  'Discovery support through tools like Shazam and key social integrations.',
  'Free UPC barcodes and ISRC support for cleaner catalog delivery.',
  'Detailed sales reports and payout visibility inside your Bouut workspace.',
  'Eligibility for promo services, playlist pitching and campaign add-ons.',
  'Access to Bouut growth tools like smart promotion and profile-ready assets.',
];

const comparisonSections: CompareSection[] = [
  {
    title: 'Basic Details',
    rows: [
      {
        label: 'Number of Platforms',
        upload: { primary: '1', secondary: 'Bouut only' },
        release: { primary: '150+ Platforms', secondary: 'Spotify, Apple Music, YouTube and more' },
      },
      {
        label: 'Monetization Through Streaming',
        upload: { primary: 'No' },
        release: { primary: 'Yes', secondary: 'Built for platform royalties' },
      },
      {
        label: 'Audio Fingerprinting',
        upload: { primary: 'No' },
        release: { primary: 'Yes' },
      },
    ],
  },
  {
    title: 'Requirements',
    rows: [
      {
        label: 'Audio File Type',
        upload: { primary: '.wav / .mp3 / .flac' },
        release: { primary: '.wav', secondary: '16 bit, 44.1 kHz' },
      },
      {
        label: 'Artwork',
        upload: { primary: '.jpg / .png / .gif' },
        release: { primary: '.jpg', secondary: '3000 x 3000 px' },
      },
      {
        label: 'Delivery Time',
        upload: { primary: 'Instant' },
        release: { primary: '7 Days' },
      },
    ],
  },
  {
    title: 'Benefits on Bouut',
    rows: [
      {
        label: 'Creation of e-Press Kit',
        upload: { primary: 'Yes' },
        release: { primary: 'Yes' },
      },
      {
        label: 'Easy Apply to Opportunities',
        upload: { primary: 'Yes' },
        release: { primary: 'Yes' },
      },
      {
        label: 'Access to Promotional Tools',
        upload: { primary: 'Yes', secondary: 'Limited' },
        release: { primary: 'Yes', secondary: 'Includes radio, TV and playlist pitching' },
      },
    ],
  },
];

const proBenefits = [
  'Upload Unlimited Tracks',
  'Distribute Unlimited Tracks',
  'Basic Opportunities',
  'Exclusive Opportunities',
  'Basic Tools: Social Media Banners, Press Release and profile assets',
  'Customizable Tools: Social Cards, AI Press Release and Pre Save Links',
  'Pitching Tools: Radio, TV and playlist support',
  'Personalized e-Press Kit',
];

export function ReleaseLandingPage() {
  const [showMembershipPopup, setShowMembershipPopup] = useState(false);

  useEffect(() => {
    if (!showMembershipPopup) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const scrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [showMembershipPopup]);

  return (
    <>
      <div className={styles.page}>
        <div className="breadcrumb">
          <Link href="/dashboard">Home</Link>
          <span>/</span>
          Distribute Your Music
        </div>

        <section className={styles.banner}>
          <div className={styles.bannerCopy}>
            <span className={styles.bannerEyebrow}>Bouut Distribution</span>
            <h2>Get your track on 150+ platforms and keep more of every stream.</h2>
            <p>Launch once, stay everywhere, and manage your release from one Bouut workspace.</p>
          </div>
          <Link href="#release-benefits" className={styles.bannerButton}>
            Start Release
            <ChevronRight size={16} />
          </Link>
          <div className={styles.bannerBadge}>
            <span>150+</span>
            <small>Platforms</small>
          </div>
        </section>

        <div className={styles.headingRow}>
          <div>
            <h1 className={styles.pageTitle}>Distribute Your Music</h1>
            <p className={styles.pageSubtitle}>Choose the purpose of your upload</p>
          </div>
          <button type="button" className={styles.helpButton} aria-label="Distribution help">
            <BadgeHelp size={18} />
          </button>
        </div>

        <section className={styles.choiceGrid}>
          {choiceCards.map(card => {
            const Icon = card.icon;
            const isPremium = card.featured;

            return (
              <article
                key={card.title}
                className={`${styles.choiceCard} ${card.featured ? styles.choiceCardFeatured : ''}`}
              >
                {card.featured && (
                  <div className={styles.recommendedBadge}>
                    <Crown size={15} />
                  </div>
                )}
                <div className={styles.choiceIconWrap}>
                  <div className={styles.choiceIconBox}>
                    <Icon size={38} strokeWidth={1.8} />
                  </div>
                </div>
                <div className={styles.choiceContent}>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <ul className={styles.choiceList}>
                    {card.bullets.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className={styles.choiceActions}>
                    {isPremium ? (
                      <button
                        type="button"
                        className={`${styles.choiceButton} ${styles.actionButton}`}
                        onClick={() => setShowMembershipPopup(true)}
                      >
                        {card.cta}
                      </button>
                    ) : (
                      <Link href={card.href} className={styles.choiceButton}>
                        {card.cta}
                      </Link>
                    )}
                    {card.note && <span className={styles.choiceNote}>{card.note}</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section id="release-benefits" className={styles.infoSection}>
          <div className={styles.infoHeader}>
            <div>
              <span className={styles.infoEyebrow}>Release With Bouut</span>
              <h2>Release Your Music with Bouut</h2>
              <p>
                Get your music on 150+ platforms including Spotify, Apple Music, Amazon Music and more.
                Unlimited releases. A cleaner catalog. A stronger artist profile.
              </p>
            </div>
            <div className={styles.infoStamp}>
              <Sparkles size={18} />
              <span>Artist-first delivery</span>
            </div>
          </div>

          <div className={styles.featureStack}>
            {distributionFeatures.map(feature => (
              <div key={feature} className={styles.featureRow}>
                <CircleCheckBig size={18} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className={styles.inlineActions}>
            <button
              type="button"
              className={`${styles.primaryAction} ${styles.actionButton}`}
              onClick={() => setShowMembershipPopup(true)}
            >
              Release Your Music
            </button>
            <Link href="/dashboard/promo-tools" className={styles.secondaryAction}>
              Explore Promo Tools
            </Link>
          </div>
        </section>

        <section id="release-comparison" className={styles.compareSection}>
          <div className={styles.compareHeading}>
            <div>
              <h2>Choose what fits best for you</h2>
              <p>Compare a Bouut-only upload with a full music distribution release.</p>
            </div>
            <div className={styles.compareLegend}>
              <div className={styles.legendChip}>Upload</div>
              <div className={`${styles.legendChip} ${styles.legendChipFeatured}`}>Release</div>
            </div>
          </div>

          <div className={styles.compareTableWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th />
                  <th>Upload</th>
                  <th>
                    <span className={styles.releaseHeader}>
                      <Crown size={15} />
                      Release
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonSections.map(section => (
                  <Fragment key={section.title}>
                    <tr className={styles.sectionRow}>
                      <th>{section.title}</th>
                      <td />
                      <td />
                    </tr>
                    {section.rows.map(row => (
                      <tr key={`${section.title}-${row.label}`}>
                        <th>{row.label}</th>
                        <td>
                          <strong>{row.upload.primary}</strong>
                          {row.upload.secondary && <span>{row.upload.secondary}</span>}
                        </td>
                        <td>
                          <strong>{row.release.primary}</strong>
                          {row.release.secondary && <span>{row.release.secondary}</span>}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.compareCtaRow}>
            <button
              type="button"
              className={`${styles.primaryAction} ${styles.actionButton}`}
              onClick={() => setShowMembershipPopup(true)}
            >
              Start Distribution
            </button>
            <Link href="/dashboard/release/my-releases" className={styles.secondaryAction}>
              View My Releases
            </Link>
          </div>
        </section>

        <section className={styles.bottomNote}>
          <div className={styles.bottomNoteCard}>
            <Globe2 size={18} />
            <div>
              <strong>Need help before you release?</strong>
              <span>
                Keep your Bouut e-Press Kit updated and your promo tools ready before launch day.
              </span>
            </div>
            <Link href="/dashboard/epk" className={styles.bottomNoteLink}>
              Update EPK
            </Link>
          </div>
        </section>
      </div>

      {showMembershipPopup && (
        <div
          className={styles.membershipOverlay}
          onClick={event => {
            if (event.target === event.currentTarget) {
              setShowMembershipPopup(false);
            }
          }}
        >
          <div className={styles.membershipDialog}>
            <button
              type="button"
              className={styles.membershipClose}
              onClick={() => setShowMembershipPopup(false)}
              aria-label="Close membership popup"
            >
              <X size={18} />
            </button>

            <div className={styles.membershipScrollArea}>
              <div className={styles.membershipHeader}>
                <h3>Choose Your Membership Plan</h3>
                <p>Get access to exclusive opportunities with Bouut Pro</p>
              </div>

              <div className={styles.membershipBody}>
                <div className={styles.membershipVisual}>
                  <img
                    src="https://songdew.com/assets/subscription/prouser.svg"
                    alt="Songdew membership illustration"
                    className={styles.membershipVisualImage}
                  />
                </div>

                <div className={styles.membershipDetails}>
                  <div className={styles.membershipPlanHeading}>
                    <Crown size={16} />
                    <span>Pro</span>
                  </div>

                  <div className={styles.membershipBenefitTable}>
                    {proBenefits.map(benefit => (
                      <div key={benefit} className={styles.membershipBenefitRow}>
                        <span>{benefit}</span>
                        <div className={styles.membershipBenefitCheck}>
                          <Check size={14} strokeWidth={2.5} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.membershipPlanCard}>
                    <span className={styles.membershipSelectedDot} />
                    <h4>Pro</h4>
                    <div className={styles.membershipPriceStack}>
                      <span className={styles.membershipOldPrice}>Rs. 4,000/Year</span>
                      <span className={styles.membershipNewPrice}>Rs. 2,000/Year</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/subscription"
                    className={styles.membershipContinue}
                    onClick={() => setShowMembershipPopup(false)}
                  >
                    Continue with Pro
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
