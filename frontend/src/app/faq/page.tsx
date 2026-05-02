'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Headphones,
  Megaphone,
  Music2,
  Rocket,
} from 'lucide-react';
import { bouutFaqs } from '@/lib/faqs';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`lp-faq-item ${open ? 'is-open' : ''}`}>
      <button type="button" className="lp-faq-toggle" onClick={() => setOpen(value => !value)}>
        <span>{q}</span>
        <ChevronDown size={18} />
      </button>
      <div className="lp-faq-answer">{a}</div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="lp lp-faq-page">
      <section className="lp-section lp-faq-hero">
        <span className="lp-contact-kicker">Bouut Music FAQ</span>
        <h1>Everything artists ask before they grow with Bouut.</h1>
        <p>
          Clear answers about promotion, distribution, ownership, support, and the
          Growth Engine so you can choose the right next step with confidence.
        </p>
      </section>

      <section className="lp-section lp-faq-page-section">
        <div className="lp-faq-page-list">
          {bouutFaqs.map(faq => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      <section className="lp-section lp-faq-next-steps">
        <div className="lp-contact-heading">
          <span className="lp-contact-kicker">Next Step</span>
          <h2 className="lp-section-title">Ready to move from questions to action?</h2>
          <p>
            Start a campaign, prepare a release, contact support, or join the Growth
            Engine when you are ready for a more structured artist plan.
          </p>
        </div>

        <div className="lp-faq-next-grid">
          <Link href="/dashboard/promo-tools/promoteyourmusic/pricing" className="lp-contact-option lp-card lp-faq-next-card">
            <span className="lp-contact-option-icon">
              <Megaphone size={24} />
            </span>
            <span className="lp-contact-option-copy">
              <strong>Promote Your Music</strong>
              <span>Choose a promotion plan and get your track in front of the right audience.</span>
              <em>Open promotion tools</em>
            </span>
            <ArrowRight size={18} />
          </Link>

          <Link href="/dashboard/release" className="lp-contact-option lp-card lp-faq-next-card">
            <span className="lp-contact-option-icon">
              <Music2 size={24} />
            </span>
            <span className="lp-contact-option-copy">
              <strong>Distribute Music</strong>
              <span>Upload your release and prepare it for global streaming platforms.</span>
              <em>Start a release</em>
            </span>
            <ArrowRight size={18} />
          </Link>

          <Link href="/dashboard/growth-engine" className="lp-contact-option lp-card lp-faq-next-card">
            <span className="lp-contact-option-icon">
              <Rocket size={24} />
            </span>
            <span className="lp-contact-option-copy">
              <strong>Join Growth Engine</strong>
              <span>Build a longer term fanbase with content, targeting, and artist growth support.</span>
              <em>Coming soon</em>
            </span>
            <ArrowRight size={18} />
          </Link>

          <Link href="/contact-us" className="lp-contact-option lp-card lp-faq-next-card">
            <span className="lp-contact-option-icon">
              <Headphones size={24} />
            </span>
            <span className="lp-contact-option-copy">
              <strong>Contact Support</strong>
              <span>Need help choosing a route? Send a message and the team can guide you.</span>
              <em>Open contact page</em>
            </span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
