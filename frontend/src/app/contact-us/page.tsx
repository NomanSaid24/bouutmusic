'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Headphones, Users2, ArrowRight, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── static data ─── */
const faqs = [
  { q: 'What is the standard response time?', a: 'Our dedicated support team typically addresses all artist and user inquiries within 24 to 48 business hours.' },
  { q: 'I want to partner with Bouut Music, who do I contact?', a: 'Please utilize the "Collaborate with Bouut" path. By using that dedicated form, your proposal will be routed directly to our business development team.' },
  { q: 'How can I report a technical issue with my dashboard?', a: 'Select the "Artist & User Support" path above and detail the exact issue. Be sure to use the email address associated with your Bouut account for faster resolution.' },
  { q: 'Does Bouut Music offer phone support?', a: 'Currently, all support tracks are securely handled via structured email chains to ensure proper tracking, file attachments, and prompt issue resolution.' },
];

/* ─── FAQ Item Component ─── */
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

export default function ContactUsPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [contactMode, setContactMode] = useState<'artist' | null>(null);

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
      gsap.utils.toArray<HTMLElement>('.lp-section').forEach(sec => {
        gsap.from(sec, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 85%', once: true },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="lp" ref={pageRef}>
      
      {/* ── 1. CONTACT US HERO / SELECTOR ── */}
      <section className="lp-section lp-contact" style={{ paddingTop: '120px' }}>
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
                  <em>EMAILS GO TO SUPPORT@BOUUTMUSIC.COM</em>
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
                  <em>OPENS THE COLLABORATION REQUEST FORM</em>
                </span>
                <ArrowRight size={18} />
              </Link>
            </div>
          )}

          {contactMode === 'artist' && (
            <div className="lp-contact-support-panel">
              <form className="lp-contact-form lp-card" onSubmit={handleArtistContactSubmit}>
                <div style={{ marginBottom: 20 }}>
                     <h3 style={{ fontSize: 24, fontWeight: 700 }}>Direct Artist Support</h3>
                     <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Please fill out the form below. It will open your default email client to seamlessly securely transmit your request.</p>
                </div>
                <div className="lp-form-row">
                  <input type="text" name="name" placeholder="Name" className="lp-input" required />
                  <input type="tel" name="phone" placeholder="Phone" className="lp-input" />
                </div>
                <input type="email" name="email" placeholder="Email" className="lp-input" required />
                <textarea name="message" placeholder="Your message..." className="lp-input lp-textarea" rows={6} required />
                
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button type="submit" className="lp-btn lp-btn-primary" style={{ flex: 1 }}>
                    Contact Support
                    </button>
                    <button type="button" onClick={() => setContactMode(null)} className="lp-btn lp-btn-outline" style={{ padding: '0 24px' }}>
                        Cancel
                    </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. FAQ FOR CONTACT SUPPORT ── */}
      <section className="lp-section lp-faq" style={{ paddingBottom: '100px' }}>
        <h2 className="lp-section-title">Frequently Asked Support Questions</h2>
        <div className="lp-faq-list">
          {faqs.map(f => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

    </div>
  );
}
