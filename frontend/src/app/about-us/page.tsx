'use client';

import Link from 'next/link';
import { ArrowRight, Globe2, Megaphone, BarChart3 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutUsPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Re-use standard landing page reveal animations
      gsap.utils.toArray<HTMLElement>('.lp-section').forEach(sec => {
        gsap.from(sec, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 85%', once: true },
        });
      });

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
      {/* ── 1. MAIN HEADER / MISSION ── */}
      <section className="lp-section lp-mission" style={{ paddingTop: '100px' }}>
        <div className="lp-mission-inner">
          <div className="lp-mission-copy">
            <div style={{ marginBottom: '40px' }}>
              <h2 className="lp-section-title" style={{ textAlign: 'left', marginBottom: '16px' }}>
                Our Vision
              </h2>
              <p className="lp-mission-text">
                To build the ultimate global ecosystem where independent artists and labels have the tools, transparency, and reach to turn their creative passion into a sustainable, lifelong career. We envision a music industry without gates, powered by equitable growth engines.
              </p>
            </div>

            <div>
              <h2 className="lp-section-title" style={{ textAlign: 'left', marginBottom: '16px' }}>
                Our Mission
              </h2>
              <p className="lp-mission-text">
                Transparent Music Business Administration. More than distribution, we&apos;re your growth partners. We rely on clear value propositions designed around empowering artists. Whether you are an independent creator or a label, we give you the keys to your own success without locking you down.
              </p>
            </div>
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

      {/* ── 2. PLATFORM BREAKDOWN ── */}
      <section className="lp-section lp-features">
        <h2 className="lp-section-title">The Complete Artist Platform</h2>
        <p className="lp-section-subtitle" style={{ maxWidth: '800px', margin: '0 auto 40px auto' }}>
          We provide a holistic ecosystem designed specifically for creators. From the moment your track is finished to the moment it hits the global charts.
        </p>
        <div className="lp-features-grid lp-stagger-parent" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          <div className="lp-card lp-feature-card lp-stagger-child">
            <div className="lp-feature-icon"><Megaphone size={24} /></div>
            <h3>Promotion</h3>
            <p>
              Submit demos, pitch to high-impact playlists, and launch custom-targeted digital marketing campaigns. Connect directly with targeted audiences to turn passive listeners into dedicated superfans.
            </p>
          </div>

          <div className="lp-card lp-feature-card lp-stagger-child">
            <div className="lp-feature-icon"><Globe2 size={24} /></div>
            <h3>Distribution</h3>
            <p>
              Release your latest single, EP, or Album simultaneously across 150+ worldwide DSPs including Spotify, Apple Music, TikTok, and Amazon Music while keeping 100% of your rights and earnings.
            </p>
          </div>

          <div className="lp-card lp-feature-card lp-stagger-child">
            <div className="lp-feature-icon"><BarChart3 size={24} /></div>
            <h3>Artist Growth Systems</h3>
            <p>
              Dive deep into audience analytics. Use data-driven insights to figure out exactly where you are growing. Implement automated royalty splits and connect intimately with the Bouut growth engine.
            </p>
          </div>

        </div>
      </section>

      {/* ── 3. CTA BANNER (Imported exactly from Home Page) ── */}
      <section className="lp-section lp-cta-banner">
        <div className="lp-cta-banner-inner">
          <h2>READY TO GROW AND RELEASE YOUR MUSIC GLOBALLY?</h2>
          <p>
            Bouut Music helps you promote your songs, distribute releases worldwide,
            and build long-term growth with the right tools and opportunities.
          </p>
          <div className="lp-cta-banner-actions">
            <Link href="/dashboard/promo-tools/cmnd249d0003zuy8o1zicok20" className="lp-cta-action">
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
