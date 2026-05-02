'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FileMusic,
  Globe2,
  Headphones,
  Quote,
  ShieldCheck,
  Split,
  type LucideIcon,
  Users2,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BorderGlow from '@/components/ReactBits/BorderGlow';
import RotatingText from '@/components/ReactBits/RotatingText';
import { bouutFaqs } from '@/lib/faqs';

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

const promoLoopItems = [
  { title: 'Submit my demo', href: '/dashboard/promo-tools/cmnd248zp003wuy8opt3ejs49', icon: '/icons/sound-waves.png' },
  { title: 'Release your music with us', href: '/dashboard/release', icon: '/icons/headphone.png' },
  { title: 'Get playlisted', href: '/dashboard/promo-tools/cmnd2496p003yuy8o33fj1gao', icon: '/icons/music-therapy.png' },
  { title: 'Promote your music', href: '/dashboard/promo-tools/promoteyourmusic/pricing', icon: '/icons/music-sheet.png' },
  { title: 'Collaborate with us', href: '/dashboard/promo-tools/cmnd249lt0040uy8o5pd9oz97', icon: '/icons/live-music.png' },
  { title: 'Join growth engine', href: '/dashboard/growth-engine', icon: '/icons/trumpet.png' },
];

const howItWorksFeatures: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Global Distribution',
    description: 'Release your music to major stores and streaming platforms worldwide.',
    icon: Globe2,
  },
  {
    title: 'Real-Time Analytics',
    description: 'Track reach, listener activity, and campaign movement from your dashboard.',
    icon: BarChart3,
  },
  {
    title: 'Revenue Tracking',
    description: 'See performance and royalty activity clearly as your music grows.',
    icon: CircleDollarSign,
  },
  {
    title: 'Royalty Splits',
    description: 'Manage collaborators, splits, and team earnings with a cleaner workflow.',
    icon: Split,
  },
  {
    title: 'Rights Management',
    description: 'Protect your ownership, metadata, and release details from one place.',
    icon: ShieldCheck,
  },
  {
    title: 'Sync Licensing',
    description: 'Prepare your catalog for film, TV, advertising, and placement opportunities.',
    icon: FileMusic,
  },
  {
    title: 'Cover Song Licensing',
    description: 'Handle cover release requirements with clearer rights and licensing support.',
    icon: BadgeCheck,
  },
];

const landingFaqs = bouutFaqs.slice(0, 5);
/*
  { q: 'Do I keep my rights?', a: 'Absolutely. Bouut Music is non-exclusive. You retain 100% ownership of your masters and publishing rights at all times.' },
  { q: 'How long to get on Spotify?', a: 'Most releases go live within 3–5 business days. We recommend submitting at least 2 weeks early for editorial playlist consideration.' },
  { q: 'How do I get paid?', a: 'Royalties are paid monthly via PayPal, bank transfer, or Payoneer. You can track your earnings in real-time through your dashboard.' },
  { q: 'Can I distribute cover songs?', a: 'Yes! We handle mechanical licensing for cover songs, so you can legally distribute your covers to all major platforms.' },
  { q: 'Is there a contract or lock-in?', a: 'No long-term contracts. You can cancel anytime and take your music with you. We believe in earning your loyalty, not locking you in.' },
];
*/

const stats = [
  { value: 70000, suffix: '+', label: 'Artists Worldwide' },
  { value: 150, suffix: '+', label: 'Stores & Platforms' },
  { value: 100, suffix: '%', label: 'Royalties Kept' },
  { value: 50, suffix: 'M+', label: 'Streams Generated' },
];

const testimonials = [
  {
    quote: 'Bouut helped me move from random uploads to a real release plan. The promo tools made my campaign feel professional from day one.',
    name: 'Sarah Jensen',
    role: 'Independent Artist',
    link: 'https://bouutmusic.app',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face',
  },
  {
    quote: 'The playlist and promotion workflow gave our single the push it needed. We finally had one place for growth, visibility, and next steps.',
    name: 'Malik Carter',
    role: 'Singer / Songwriter',
    link: 'New single campaign',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face',
  },
  {
    quote: 'Distribution was simple, but the real win was the guidance. Bouut made it easier to understand what to do after the song went live.',
    name: 'Amara Lee',
    role: 'Pop Artist',
    link: 'Global release',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=face',
  },
  {
    quote: 'We used Bouut for a campaign launch and the process was clean. The team helped position our music for the listeners we actually wanted.',
    name: 'Noah Rivers',
    role: 'Producer',
    link: 'Campaign support',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=face',
  },
  {
    quote: 'I liked that the focus was organic growth. No fake promises, just a better system for getting my music seen, shared, and tracked.',
    name: 'Lina Brooks',
    role: 'R&B Artist',
    link: 'Growth Engine',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=face',
  },
  {
    quote: 'Bouut gave our label a cleaner way to support artists. The tools are direct, the forms are clear, and the campaign flow saves time.',
    name: 'Andre Miles',
    role: 'Label Manager',
    link: 'Label partner',
    avatar: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=160&h=160&fit=crop&crop=face',
  },
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
      <button type="button" className="lp-faq-toggle" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <ChevronDown size={18} />
      </button>
      <div className="lp-faq-answer">{a}</div>
    </div>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [contactMode, setContactMode] = useState<'artist' | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const visibleTestimonials = [0, 1].map(offset => testimonials[(testimonialIndex + offset) % testimonials.length]);

  const showPreviousTestimonials = () => {
    setTestimonialIndex(index => (index - 2 + testimonials.length) % testimonials.length);
  };

  const showNextTestimonials = () => {
    setTestimonialIndex(index => (index + 2) % testimonials.length);
  };

  function handleArtistContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const body = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n');

    window.location.href = `mailto:support@bouutmusic.com?subject=${encodeURIComponent('Bouut Music Support Request')}&body=${encodeURIComponent(body)}`;
  }

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
            trigger: sticky,
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
              <div className="lp-sonar-eyebrow">
                <span>Your Music Deserves to Be</span>
                <RotatingText
                  texts={['Heard', 'Discovered', 'Streamed', 'Shared', 'Paid']}
                  mainClassName="lp-sonar-rotating-word"
                  staggerFrom="last"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-120%' }}
                  staggerDuration={0.025}
                  splitLevelClassName="lp-sonar-rotating-split"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </div>
              <div className="lp-sonar-title-row">
                <span className="lp-sonar-slant">the</span>
                <h1 className="lp-sonar-title-word">Sound</h1>
                <span className="lp-sonar-slant lp-sonar-slant-right">of</span>
              </div>
              <h1 className="lp-sonar-title-main">Bouut Music</h1>
              <Link href="/dashboard/promo-tools/promoteyourmusic/pricing" className="lp-sonar-promote-cta">
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
            <div className="lp-sonar-cta-row">
              <Link href="/dashboard/promo-tools/cmnd248zp003wuy8opt3ejs49" className="lp-sonar-cta w-inline-block">
                <div className="lp-sonar-cta-text-wrapper">
                  <div className="lp-sonar-cta-text">SUBMIT YOUR DEMO</div>
                </div>
                <div className="lp-sonar-cta-arrow">
                  <img src="https://cdn.prod.website-files.com/64e6091972f5864e5b3e6f9e/655ccd5318b54f8d914c692e_arrow_white.svg" loading="lazy" alt="arrow right" className="img" />
                </div>
              </Link>

              <Link href="/dashboard/release" className="lp-sonar-cta w-inline-block">
                <div className="lp-sonar-cta-text-wrapper">
                  <div className="lp-sonar-cta-text">DISTRIBUTION</div>
                </div>
                <div className="lp-sonar-cta-arrow">
                  <img src="https://cdn.prod.website-files.com/64e6091972f5864e5b3e6f9e/655ccd5318b54f8d914c692e_arrow_white.svg" loading="lazy" alt="arrow right" className="img" />
                </div>
              </Link>

              <Link href="/dashboard/growth-engine" className="lp-sonar-cta w-inline-block">
                <div className="lp-sonar-cta-text-wrapper">
                  <div className="lp-sonar-cta-text">JOIN GROWTH ENGINE</div>
                </div>
                <div className="lp-sonar-cta-arrow">
                  <img src="https://cdn.prod.website-files.com/64e6091972f5864e5b3e6f9e/655ccd5318b54f8d914c692e_arrow_white.svg" loading="lazy" alt="arrow right" className="img" />
                </div>
              </Link>
            </div>
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
            <Link href="/about-us" className="lp-btn lp-btn-outline" style={{ marginTop: 16 }}>
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

      {/* ── 6. PRICING / PROMO LOOP ── */}
      <section className="lp-section lp-features">
        <h2 className="lp-section-title">How It Works</h2>
        <p className="lp-section-subtitle">
          From release setup to audience growth, Bouut gives artists the tools to manage,
          promote, and understand their music journey.
        </p>
        <div className="lp-features-grid lp-stagger-parent">
          {howItWorksFeatures.map(feature => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="lp-card lp-feature-card lp-stagger-child">
                <div className="lp-feature-icon">
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="lp-section lp-pricing lp-services-loop" aria-label="Promo services">
        <div className="lp-loop-intro">
          <span className="lp-loop-kicker">Music Promotion</span>
          <h2 className="lp-loop-heading">Music Promotion Tools</h2>
          <p className="lp-loop-copy">
            Submit demos, pitch playlists, launch campaigns, and connect with opportunities
            designed to help your music reach the right audience.
          </p>
        </div>

        <div className="lp-services-loop-sticky">
          <div className="lp-loop-grid">
            <div className="lp-loop-list-wrap">
              <ul className="lp-loop-list" aria-label="Promo service steps">
                {promoLoopItems.map((item, index) => (
                  <li key={item.title} className="lp-loop-list-item">
                    <Link href={item.href} className="lp-loop-list-link">
                      <span className="lp-loop-arrow" aria-hidden="true">
                        <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.818 3.271v16.547H3.27M19.732 19.37 2.182 1.82" stroke="currentColor" strokeWidth="3.599" />
                        </svg>
                      </span>
                      <span className="lp-loop-list-text">{item.title}</span>
                    </Link>
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
                    <div key={item.title} className="lp-loop-circle-title">
                      <img src={item.icon} alt={item.title} className="lp-loop-circle-icon" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. SUCCESS STORIES ── */}
      <section className="lp-section lp-testimonial">
        <div className="lp-testimonial-shell">
          <div className="lp-testimonial-header">
            <div>
              <span className="lp-testimonial-kicker">Artist voices</span>
              <h2 className="lp-section-title">Artist Success Stories</h2>
            </div>
            <div className="lp-testimonial-controls" aria-label="Testimonial carousel controls">
              <button type="button" onClick={showPreviousTestimonials} aria-label="Previous testimonials">
                <ChevronLeft size={20} />
              </button>
              <button type="button" onClick={showNextTestimonials} aria-label="Next testimonials">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="lp-testimonial-grid" aria-live="polite">
            {visibleTestimonials.map((testimonial, index) => (
              <BorderGlow
                key={`${testimonial.name}-${testimonialIndex}-${index}`}
                className="lp-testimonial-glow"
                backgroundColor="#120F17"
                borderRadius={24}
                glowColor="358 75 65"
                glowRadius={34}
                glowIntensity={1.15}
                coneSpread={24}
                colors={['#e96061', '#f6b0a8', '#e6e5dd']}
                fillOpacity={0.28}
              >
                <article className="lp-testimonial-card">
                  <div className="lp-testimonial-topline">
                    <span>0{((testimonialIndex + index) % testimonials.length) + 1}</span>
                    <Quote size={34} />
                  </div>
                  <blockquote className="lp-testimonial-quote">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="lp-testimonial-author">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="lp-testimonial-avatar"
                    />
                    <div>
                      <strong>{testimonial.name}</strong>
                      <span className="lp-testimonial-role">{testimonial.role}</span>
                      <span className="lp-testimonial-link">{testimonial.link}</span>
                    </div>
                  </div>
                </article>
              </BorderGlow>
            ))}
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
          {landingFaqs.map(f => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
        <div className="lp-faq-actions">
          <Link href="/faq" className="lp-btn lp-btn-outline">
            View all FAQs <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── 11. CONTACT US ── */}
      <section className="lp-section lp-contact">
        <div className="lp-contact-inner">
          <div className="lp-contact-heading">
            <span className="lp-contact-kicker">Contact Bouut Music</span>
            <h2 className="lp-section-title">Choose the right contact path</h2>
            <p>
              Artists and everyday users can reach our support team directly. Businesses,
              companies, brands, and larger partners can use the collaboration request form
              so we collect the right project details from the start.
            </p>
          </div>

          {contactMode !== 'artist' && (
            <div className="lp-contact-options">
              <button
                type="button"
                className="lp-contact-option lp-card"
                onClick={() => setContactMode('artist')}
              >
                <span className="lp-contact-option-icon">
                  <Headphones size={24} />
                </span>
                <span className="lp-contact-option-copy">
                  <strong>Artist & User Support</strong>
                  <span>For account help, release questions, dashboard issues, and general artist support.</span>
                  <em>Emails go to support@bouutmusic.com</em>
                </span>
                <ArrowRight size={18} />
              </button>

              <Link
                href="/dashboard/promo-tools/cmnd249lt0040uy8o5pd9oz97"
                className="lp-contact-option lp-card"
              >
                <span className="lp-contact-option-icon">
                  <Users2 size={24} />
                </span>
                <span className="lp-contact-option-copy">
                  <strong>Collaborate With Bouut</strong>
                  <span>For businesses, companies, brands, labels, media partners, and larger collaboration ideas.</span>
                  <em>Opens the collaboration request form</em>
                </span>
                <ArrowRight size={18} />
              </Link>
            </div>
          )}

          {contactMode === 'artist' && (
            <div className="lp-contact-support-panel">
              <form className="lp-contact-form lp-card" onSubmit={handleArtistContactSubmit}>
                <div className="lp-form-row">
                  <input type="text" name="name" placeholder="Name" className="lp-input" required />
                  <input type="tel" name="phone" placeholder="Phone" className="lp-input" />
                </div>
                <input type="email" name="email" placeholder="Email" className="lp-input" required />
                <textarea name="message" placeholder="Your message..." className="lp-input lp-textarea" rows={4} required />
                <button type="submit" className="lp-btn lp-btn-primary" style={{ width: '100%' }}>
                  Contact Support
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── 12. CTA BANNER ── */}
      <section className="lp-section lp-cta-banner">
        <div className="lp-cta-banner-inner">
          <h2>READY TO GROW AND RELEASE YOUR MUSIC GLOBALLY?</h2>
          <p>
            Bouut Music helps you promote your songs, distribute releases worldwide,
            and build long-term growth with the right tools and opportunities.
          </p>
          <div className="lp-cta-banner-actions">
            <Link href="/dashboard/promo-tools/promoteyourmusic/pricing" className="lp-cta-action">
              <span className="lp-cta-action-text-wrapper">
                <span className="lp-cta-action-text">Promote your music</span>
              </span>
              <span className="lp-cta-action-arrow">
                <img src="https://cdn.prod.website-files.com/64e6091972f5864e5b3e6f9e/655ccd5318b54f8d914c692e_arrow_white.svg" loading="lazy" alt="arrow right" className="img" />
              </span>
            </Link>
            <Link href="/dashboard/release" className="lp-cta-action">
              <span className="lp-cta-action-text-wrapper">
                <span className="lp-cta-action-text">Distribute Music</span>
              </span>
              <span className="lp-cta-action-arrow">
                <img src="https://cdn.prod.website-files.com/64e6091972f5864e5b3e6f9e/655ccd5318b54f8d914c692e_arrow_white.svg" loading="lazy" alt="arrow right" className="img" />
              </span>
            </Link>
            <Link href="/dashboard/growth-engine" className="lp-cta-action">
              <span className="lp-cta-action-text-wrapper">
                <span className="lp-cta-action-text">Join Growth Engine</span>
              </span>
              <span className="lp-cta-action-arrow">
                <img src="https://cdn.prod.website-files.com/64e6091972f5864e5b3e6f9e/655ccd5318b54f8d914c692e_arrow_white.svg" loading="lazy" alt="arrow right" className="img" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
