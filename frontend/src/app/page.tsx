'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  ChevronDown,
  Cloud,
  Globe2,
  Headphones,
  Megaphone,
  Music2,
  Play,
  Shield,
  Upload,
  Users2,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── static data ─── */
const communityFaces = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face',
];

const platforms = [
  'Spotify', 'Apple Music', 'TikTok', 'Amazon Music',
  'YouTube', 'Tidal', 'Deezer', 'Amar Music', 'Rive',
  'Cleand', 'Semicasing',
];

const howItWorks = [
  { step: 1, icon: <Upload size={28} />, title: 'Upload Your Audio & Artwork', desc: 'Drag and drop your tracks, add metadata, and upload your cover art in minutes.' },
  { step: 2, icon: <Globe2 size={28} />, title: 'Choose Your Global Stores', desc: 'Select from 150+ streaming platforms and digital stores worldwide.' },
  { step: 3, icon: <BadgeDollarSign size={28} />, title: 'Collect 100% Royalties', desc: 'Keep full ownership and earn every cent your music generates.' },
];

const features = [
  { icon: <Globe2 size={22} />, title: 'Global Distribution', desc: 'Reaching 100+ stores worldwide with a single upload.' },
  { icon: <BarChart3 size={22} />, title: 'Real-time Analytics', desc: 'Advanced stream tracking and revenue insights.' },
  { icon: <Megaphone size={22} />, title: 'Promotion Tools', desc: 'Smart links, playlist pitching, and social promo.' },
  { icon: <BadgeDollarSign size={22} />, title: 'Royalty Splits', desc: 'Seamless payment distribution to collaborators.' },
  { icon: <Shield size={22} />, title: 'Rights Management', desc: 'Protect and manage your intellectual property.' },
  { icon: <Music2 size={22} />, title: 'Sync Licensing', desc: 'Film, TV, and advertising placement opportunities.' },
  { icon: <Headphones size={22} />, title: 'Cover Song Licensing', desc: 'Legal rights managed for cover releases.' },
];

const pricingTiers = [
  {
    name: 'Free Tier',
    price: 'Free',
    desc: 'Free to upload. Keep 80% of royalties.',
    features: ['Unlimited uploads', '80% royalty rate', 'Basic analytics', 'Standard support', 'Global distribution'],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/mo',
    desc: 'Artist-first annual fee. Keep 100%, share features.',
    features: ['Everything in Free', '100% royalty rate', 'Advanced analytics', 'Priority support', 'Playlist pitching', 'Smart links'],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Label Pro',
    price: '$14.99',
    period: '/mo',
    desc: 'Artist fee, vryunit fee, keep 100%, more features.',
    features: ['Everything in Pro', 'Label dashboard', 'Multi-artist management', 'Custom branding', 'API access', 'Dedicated manager'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  { q: 'Do I keep my rights?', a: 'Absolutely. Bouut Music is non-exclusive. You retain 100% ownership of your masters and publishing rights at all times.' },
  { q: 'How long to get on Spotify?', a: 'Most releases go live within 3–5 business days. We recommend submitting at least 2 weeks early for editorial playlist consideration.' },
  { q: 'How do I get paid?', a: 'Royalties are paid monthly via PayPal, bank transfer, or Payoneer. You can track your earnings in real-time through your dashboard.' },
  { q: 'Can I distribute cover songs?', a: 'Yes! We handle mechanical licensing for cover songs, so you can legally distribute your covers to all major platforms.' },
  { q: 'Is there a contract or lock-in?', a: 'No long-term contracts. You can cancel anytime and take your music with you. We believe in earning your loyalty, not locking you in.' },
];

const stats = [
  { value: 70000, suffix: '+', label: 'Artists Worldwide' },
  { value: 150, suffix: '+', label: 'Stores & Platforms' },
  { value: 100, suffix: '%', label: 'Royalties Kept' },
  { value: 50, suffix: 'M+', label: 'Streams Generated' },
];

/* ─── Animated counter ─── */
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => setDisplayed(Math.floor(obj.val)),
          });
        },
      });
    });
    return () => ctx.revert();
  }, [target]);

  return <span ref={ref}>{displayed.toLocaleString()}{suffix}</span>;
}

/* ─── FAQ Item ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`lp-faq-item ${open ? 'is-open' : ''}`}>
      <button className="lp-faq-toggle" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <ChevronDown size={18} />
      </button>
      <div className="lp-faq-answer">{a}</div>
    </div>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Reveal every section on scroll */
      gsap.utils.toArray<HTMLElement>('.lp-section').forEach(sec => {
        gsap.from(sec, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 85%', once: true },
        });
      });

      /* Stagger cards */
      gsap.utils.toArray<HTMLElement>('.lp-stagger-parent').forEach(parent => {
        const kids = parent.querySelectorAll('.lp-stagger-child');
        gsap.from(kids, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: parent, start: 'top 80%', once: true },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="lp" ref={pageRef}>
      {/* ── 1. HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <span className="lp-kicker">The Power Of</span>
            <h1 className="lp-hero-title">
              UNLEASH YOUR<br />SOUND WORLDWIDE
            </h1>
            <p className="lp-hero-desc">
              Your All-in-One Platform for Distribution, Promotion,
              and Business Growth. Keep 100% of your rights.
              Upload in Minutes.
            </p>
            <div className="lp-hero-actions">
              {isAuthenticated ? (
                <Link href="/dashboard" className="lp-btn lp-btn-primary">
                  Open Dashboard
                </Link>
              ) : (
                <button
                  className="lp-btn lp-btn-primary"
                  onClick={() => openAuthModal('register', '/dashboard')}
                >
                  GET STARTED NOW
                </button>
              )}
              <Link href="/dashboard/subscription" className="lp-btn lp-btn-ghost">
                Explore Pro
              </Link>
            </div>
            <div className="lp-community">
              <div className="lp-avatar-stack">
                {communityFaces.map(src => (
                  <img key={src} src={src} alt="Artist" className="lp-avatar" />
                ))}
                <div className="lp-avatar-badge">70K+</div>
              </div>
              <span className="lp-community-label">Artists trust us</span>
            </div>
          </div>
          <div className="lp-hero-visual">
            <div className="lp-dashboard-preview">
              <img
                src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900&h=600&fit=crop"
                alt="Dashboard preview"
                className="lp-dashboard-img"
              />
              <div className="lp-dashboard-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PLATFORM LOGOS ── */}
      <section className="lp-section lp-platforms">
        <div className="lp-platforms-track">
          {[...platforms, ...platforms].map((name, i) => (
            <span key={i} className="lp-platform-name">{name}</span>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section className="lp-section lp-how">
        <h2 className="lp-section-title">How It Works</h2>
        <div className="lp-how-grid lp-stagger-parent">
          {howItWorks.map(item => (
            <article key={item.step} className="lp-card lp-how-card lp-stagger-child">
              <div className="lp-how-icon">{item.icon}</div>
              <div className="lp-how-step">Step {item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 4. MISSION ── */}
      <section className="lp-section lp-mission">
        <div className="lp-mission-inner">
          <div className="lp-mission-copy">
            <h2 className="lp-section-title" style={{ textAlign: 'left' }}>
              Our Mission: Transparent Music Business Administration
            </h2>
            <p className="lp-mission-text">
              More than distribution, we&apos;re your growth partners. We replicate the core theme of music administration,
              making it a clear value proposition statement about empowering artists.
              Integrate a powerful photo of an artist working, with stylized data points floating around them.
            </p>
            <Link href="/dashboard" className="lp-btn lp-btn-outline" style={{ marginTop: 16 }}>
              Learn More <ArrowRight size={14} />
            </Link>
          </div>
          <div className="lp-mission-visual">
            <img
              src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop"
              alt="Artist in studio"
              className="lp-mission-img"
            />
            <div className="lp-mission-float lp-mission-float-1">
              <Zap size={14} /> 13.0M Streams
            </div>
            <div className="lp-mission-float lp-mission-float-2">
              <BarChart3 size={14} /> $4,000 Revenue
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FEATURES GRID ── */}
      <section className="lp-section lp-features">
        <h2 className="lp-section-title">How It Works</h2>
        <p className="lp-section-subtitle">Everything you need to distribute, promote, and grow your music career.</p>
        <div className="lp-features-grid lp-stagger-parent">
          {features.map(f => (
            <article key={f.title} className="lp-card lp-feature-card lp-stagger-child">
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 6. PRICING ── */}
      <section className="lp-section lp-pricing">
        <h2 className="lp-section-title">Your Music, Your Money</h2>
        <p className="lp-section-subtitle">Choose the plan that fits your journey.</p>
        <div className="lp-pricing-grid lp-stagger-parent">
          {pricingTiers.map(tier => (
            <article
              key={tier.name}
              className={`lp-card lp-pricing-card lp-stagger-child ${tier.popular ? 'lp-pricing-popular' : ''}`}
            >
              {tier.popular && <div className="lp-popular-badge">Most Popular</div>}
              <h3 className="lp-pricing-name">{tier.name}</h3>
              <div className="lp-pricing-price">
                {tier.price}
                {tier.period && <span className="lp-pricing-period">{tier.period}</span>}
              </div>
              <p className="lp-pricing-desc">{tier.desc}</p>
              <ul className="lp-pricing-features">
                {tier.features.map(f => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button
                className={`lp-btn ${tier.popular ? 'lp-btn-primary' : 'lp-btn-outline'}`}
                onClick={() => {
                  if (isAuthenticated) {
                    window.location.href = '/dashboard/subscription';
                  } else {
                    openAuthModal('register', '/dashboard/subscription');
                  }
                }}
              >
                {tier.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ── 7. YOUTUBE SHOWCASE ── */}
      <section className="lp-section lp-youtube">
        <h2 className="lp-section-title">Watch Our Story</h2>
        <p className="lp-section-subtitle">See how Bouut Music is empowering independent artists worldwide.</p>
        <div className="lp-youtube-wrapper">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Bouut Music"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="lp-youtube-iframe"
          />
        </div>
      </section>

      {/* ── 8. SUCCESS STORIES ── */}
      <section className="lp-section lp-testimonial">
        <h2 className="lp-section-title">Artist Success Stories</h2>
        <div className="lp-testimonial-card">
          <blockquote className="lp-testimonial-quote">
            &ldquo;Distribution changed my life. Bouut helped me reach audiences I never
            imagined. The platform is intuitive, the support is incredible, and I&apos;ve
            seen my streams grow exponentially.&rdquo;
          </blockquote>
          <div className="lp-testimonial-author">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face"
              alt="Sarah Jensen"
              className="lp-testimonial-avatar"
            />
            <div>
              <strong>Sarah Jensen</strong>
              <a href="#" className="lp-testimonial-link">https://bouutmusic.app</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. ARTIST COMMUNITY / STATS ── */}
      <section className="lp-section lp-stats">
        <div className="lp-stats-grid lp-stagger-parent">
          {stats.map(s => (
            <div key={s.label} className="lp-card lp-stat-card lp-stagger-child">
              <div className="lp-stat-value">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. FAQ ── */}
      <section className="lp-section lp-faq">
        <h2 className="lp-section-title">FAQ</h2>
        <div className="lp-faq-list">
          {faqs.map(f => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ── 11. CONTACT US ── */}
      <section className="lp-section lp-contact">
        <div className="lp-contact-inner">
          <div className="lp-contact-info">
            <h2 className="lp-section-title" style={{ textAlign: 'left' }}>Contact Us</h2>
            <div className="lp-contact-detail">
              <strong>Address</strong>
              <p>138 4th Avenue Ste 568<br />Clock Garebens Core</p>
            </div>
            <div className="lp-contact-detail">
              <strong>Email</strong>
              <p>support@bouutmusic.com</p>
            </div>
          </div>
          <form className="lp-contact-form lp-card" onSubmit={e => e.preventDefault()}>
            <div className="lp-form-row">
              <input type="text" placeholder="Name" className="lp-input" />
              <input type="tel" placeholder="Phone" className="lp-input" />
            </div>
            <input type="email" placeholder="Email" className="lp-input" />
            <textarea placeholder="Your message..." className="lp-input lp-textarea" rows={4} />
            <button type="submit" className="lp-btn lp-btn-primary" style={{ width: '100%' }}>
              Contact
            </button>
          </form>
        </div>
      </section>

      {/* ── 12. CTA BANNER ── */}
      <section className="lp-section lp-cta-banner">
        <div className="lp-cta-banner-inner">
          <h2>JOIN THE 70K+ ARTIST NETWORK</h2>
          <p>START YOUR JOURNEY</p>
          <button
            className="lp-btn lp-btn-white"
            onClick={() => {
              if (isAuthenticated) {
                window.location.href = '/dashboard';
              } else {
                openAuthModal('register', '/dashboard');
              }
            }}
          >
            START YOUR JOURNEY <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
