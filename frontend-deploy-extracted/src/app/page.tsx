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
  Users2,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── static data ─── */
const platforms = [
  { name: 'Spotify', logo: '/music-companies-logos/spotify.png' },
  { name: 'Apple Music', logo: '/music-companies-logos/apple-music.png' },
  { name: 'TikTok', logo: '/music-companies-logos/tiktok.png' },
  { name: 'Amazon Music', logo: '/music-companies-logos/amazon-music.png' },
  { name: 'YouTube', logo: '/music-companies-logos/youtube.png' },
  { name: 'YouTube Music', logo: '/music-companies-logos/youtube-music.png' },
  { name: 'Tidal', logo: '/music-companies-logos/tidal.png' },
  { name: 'Deezer', logo: '/music-companies-logos/deezer.png' },
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

const promoLoopItems = [
  { title: 'Submit my demo', priceLabel: 'Free' },
  { title: 'Release your music with us', priceLabel: 'Rs. 299' },
  { title: 'Get playlisted', priceLabel: 'Free' },
  { title: 'Promote my music', priceLabel: 'Rs. 4,999' },
  { title: 'Collaborate with us', priceLabel: 'Free' },
  { title: 'Promote your music', priceLabel: 'Free' },
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
        if (sec.classList.contains('lp-services-loop')) return;

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

      const serviceLoop = pageRef.current?.querySelector<HTMLElement>('.lp-services-loop');
      const sticky = serviceLoop?.querySelector<HTMLElement>('.lp-services-loop-sticky');

      if (serviceLoop && sticky) {
        const listItems = gsap.utils.toArray<HTMLElement>('.lp-loop-list-item', serviceLoop);
        const bigNumbers = gsap.utils.toArray<HTMLElement>('.lp-loop-number', serviceLoop);
        const circleTitles = gsap.utils.toArray<HTMLElement>('.lp-loop-circle-title', serviceLoop);
        const orbitDots = gsap.utils.toArray<HTMLElement>('.lp-loop-orbit-dot-mark', serviceLoop);
        const currentCount = serviceLoop.querySelector<HTMLElement>('.lp-loop-circle-current-count');
        const progressCircle = serviceLoop.querySelector<SVGCircleElement>('.lp-loop-orbit-progress-circle');
        const total = promoLoopItems.length;
        let activeIndex = -1;
        let circleLength = 0;

        const syncProgressCircle = () => {
          if (!progressCircle) return;

          circleLength = progressCircle.getTotalLength();
          gsap.set(progressCircle, {
            strokeDasharray: `${circleLength} ${circleLength}`,
            strokeDashoffset: circleLength,
          });
        };

        const setActive = (nextIndex: number, immediate = false) => {
          if (nextIndex === activeIndex) return;
          activeIndex = nextIndex;
          const duration = immediate ? 0 : 0.72;
          const ease = immediate ? 'none' : 'expo.out';

          listItems.forEach((item, itemIndex) => {
            const isSeen = itemIndex <= nextIndex;
            const isActive = itemIndex === nextIndex;
            item.classList.toggle('is-seen', isSeen);
            item.classList.toggle('is-active', isActive);
            gsap.to(item, {
              opacity: isSeen ? 1 : 0,
              y: isSeen ? 0 : 16,
              duration,
              ease,
              overwrite: true,
            });
          });

          bigNumbers.forEach((number, numberIndex) => {
            gsap.to(number, {
              opacity: numberIndex === nextIndex ? 1 : 0,
              yPercent: (numberIndex - nextIndex) * 18,
              clipPath: numberIndex === nextIndex ? 'inset(0% 0% 0% 0%)' : numberIndex < nextIndex ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)',
              duration,
              ease,
              overwrite: true,
            });
          });

          circleTitles.forEach((title, titleIndex) => {
            gsap.to(title, {
              opacity: titleIndex === nextIndex ? 1 : 0,
              yPercent: (titleIndex - nextIndex) * 14,
              clipPath: titleIndex === nextIndex ? 'inset(0% 0% 0% 0%)' : titleIndex < nextIndex ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)',
              duration,
              ease,
              overwrite: true,
            });
          });

          orbitDots.forEach((dot, dotIndex) => {
            gsap.to(dot, {
              scale: dotIndex <= nextIndex ? 1 : 0,
              opacity: dotIndex <= nextIndex ? 1 : 0,
              duration: immediate ? 0 : 0.38,
              ease: immediate ? 'none' : 'power3.out',
              overwrite: true,
            });
          });

          if (currentCount) {
            currentCount.textContent = String(nextIndex + 1).padStart(2, '0');
          }

        };

        syncProgressCircle();
        setActive(0, true);

        const loopTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: serviceLoop,
            start: 'top top',
            end: () => `+=${window.innerHeight * total}`,
            pin: sticky,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: syncProgressCircle,
            onUpdate: self => {
              const nextIndex = Math.min(total - 1, Math.floor(self.progress * total));
              setActive(nextIndex);
            },
          },
        });

        loopTimeline.to(progressCircle, { strokeDashoffset: 0, ease: 'none' }, 0);
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="lp" ref={pageRef}>
      {/* ── 1. HERO ── */}
      <section className="lp-hero">
        <div className="lp-sonar-hero-bg">
          <div className="lp-sonar-hero-image" />
          <div className="lp-sonar-hero-grad-black" />
          <div className="lp-sonar-hero-grad-warm" />
          <div className="lp-sonar-hero-grain" />
        </div>

        <div className="lp-sonar-hero-overlay" />

        <div className="lp-sonar-hero-content">
          <div className="lp-sonar-hero-col lp-sonar-hero-left">
            <div className="lp-sonar-project-title">Bouut Music</div>
            <div className="lp-sonar-project-cat">Distribution</div>
          </div>

          <div className="lp-sonar-hero-col lp-sonar-hero-center">
            <div className="lp-sonar-title-wrap">
              <div className="lp-sonar-eyebrow">A MUSIC DISTRIBUTION STUDIO</div>
              <div className="lp-sonar-title-row">
                <span className="lp-sonar-slant">the</span>
                <h1 className="lp-sonar-title-word">Sound</h1>
                <span className="lp-sonar-slant lp-sonar-slant-right">of</span>
              </div>
              <h1 className="lp-sonar-title-main">Bouut Music</h1>
              <Link href="/dashboard/promo-tools" className="lp-sonar-promote-cta">
                Promote your Music
              </Link>
            </div>

            <p className="lp-sonar-hero-desc">
              Bouut Music is an artist-first music distribution and promotion platform
              built for independent creators, labels, and teams. Release worldwide,
              grow your audience, and keep control of your rights.
            </p>
          </div>

          <div className="lp-sonar-hero-col lp-sonar-hero-right">
            {isAuthenticated ? (
              <Link href="/dashboard" className="lp-sonar-cta">
                <span className="lp-sonar-cta-text">Open Dashboard</span>
                <span className="lp-sonar-dashes" />
                <span className="lp-sonar-cta-arrow">-&gt;</span>
              </Link>
            ) : (
              <button
                type="button"
                className="lp-sonar-cta"
                onClick={() => openAuthModal('register', '/dashboard')}
              >
                <span className="lp-sonar-cta-text">Start Journey</span>
                <span className="lp-sonar-dashes" />
                <span className="lp-sonar-cta-arrow">-&gt;</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. PLATFORM LOGOS ── */}
      <section className="lp-section lp-platforms">
        <div className="lp-platforms-track">
          {[...platforms, ...platforms].map((platform, i) => (
            <span key={`${platform.name}-${i}`} className="lp-platform-name">
              <img src={platform.logo} alt="" className="lp-platform-logo" />
              <span>{platform.name}</span>
            </span>
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

      {/* ── 6. PRICING / PROMO LOOP ── */}
      <section className="lp-section lp-pricing lp-services-loop" aria-label="Promo services">
        <div className="lp-services-loop-sticky">
          <div className="lp-loop-intro">
            <span className="lp-loop-kicker">Music Promotion</span>
            <h2 className="lp-loop-heading">Music Promotion Tools</h2>
            <p className="lp-loop-copy">
              Submit demos, pitch playlists, launch campaigns, and connect with opportunities
              designed to help your music reach the right audience.
            </p>
          </div>

          <div className="lp-loop-grid">
            <div className="lp-loop-list-wrap">
              <ul className="lp-loop-list" aria-label="Promo service steps">
                {promoLoopItems.map((item, index) => (
                  <li key={item.title} className="lp-loop-list-item">
                    <span className="lp-loop-arrow" aria-hidden="true">
                      <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.818 3.271v16.547H3.27M19.732 19.37 2.182 1.82" stroke="currentColor" strokeWidth="3.599" />
                      </svg>
                    </span>
                    <span className="lp-loop-list-text">{item.title}</span>
                  </li>
                ))}
              </ul>

              <div className="lp-loop-number-wrap" aria-hidden="true">
                {promoLoopItems.map((item, index) => (
                  <span key={item.title} className="lp-loop-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>

            <div className="lp-loop-visual" aria-live="polite">
              <div className="lp-loop-orbit" aria-hidden="true">
                <svg className="lp-loop-orbit-svg" viewBox="0 0 400 400">
                  <circle className="lp-loop-orbit-progress-circle" cx="200" cy="200" r="198.5" />
                </svg>
                {promoLoopItems.map((item, index) => (
                  <span
                    key={item.title}
                    className="lp-loop-orbit-dot"
                    style={{ transform: `rotate(${180 + index * (360 / promoLoopItems.length)}deg) translateX(clamp(135px, 13vw, 210px))` }}
                  >
                    <span className="lp-loop-orbit-dot-mark" />
                  </span>
                ))}
              </div>

              <div className="lp-loop-circle-core">
                <div className="lp-loop-circle-count">
                  <span className="lp-loop-circle-current-count">01</span>
                  <span>/06</span>
                </div>

                <div className="lp-loop-circle-title-wrap">
                  {promoLoopItems.map(item => (
                    <h2 key={item.title} className="lp-loop-circle-title">{item.priceLabel}</h2>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
