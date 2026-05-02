import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Twitter, Youtube } from 'lucide-react';

const footerColumns = [
  {
    title: 'Brands',
    links: [
      { label: 'Soundscapes', href: '/songs' },
      { label: 'Sync Licensing', href: '/dashboard/opportunities' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Roaster', href: '/roaster' },
      { label: 'Playlists', href: '/playlists' },
      { label: 'Blogs', href: '/blogs' },
    ],
  },
  {
    title: 'Artists',
    links: [
      { label: 'E-Profile', href: '/dashboard/epk' },
      { label: 'Distribute', href: '/dashboard/release' },
      { label: 'Promote', href: '/dashboard/promo-tools' },
      { label: 'Broadcast on TV', href: '/dashboard/broadcast' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Careers', href: '/blogs' },
    ],
  },
  {
    title: 'Terms',
    links: [
      { label: 'Terms of Use', href: '/terms-of-use' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Community Guidelines', href: '/community-guidelines' },
      { label: 'License Agreement', href: '/license-agreement' },
      { label: 'Publishing Agreement', href: '/publishing-agreement' },
    ],
  },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: <Instagram size={18} strokeWidth={1.9} /> },
  { label: 'Facebook', href: 'https://facebook.com', icon: <Facebook size={18} strokeWidth={1.9} /> },
  { label: 'X', href: 'https://x.com', icon: <Twitter size={18} strokeWidth={1.9} /> },
  { label: 'YouTube', href: 'https://youtube.com', icon: <Youtube size={18} strokeWidth={1.9} /> },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        {footerColumns.map(column => (
          <div key={column.title} className="site-footer-column">
            <h3 className="site-footer-heading">{column.title}</h3>
            <div className="site-footer-links">
              {column.links.map(link => (
                <Link key={`${column.title}-${link.label}`} href={link.href} className="site-footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="site-footer-column site-footer-column-contact">
          <h3 className="site-footer-heading">Contact Us</h3>
          <div className="site-footer-contact-list">
            <a href="mailto:contact@bouutmusic.com" className="site-footer-contact site-footer-contact-email">
              <Mail size={15} />
              <span>contact@bouutmusic.com</span>
            </a>
            <div className="site-footer-contact">
              <MapPin size={15} />
              <span className="site-footer-address">
                Plot No 44BA, Enkay Square
                <br />
                Bouut Media Pvt Ltd
                <br />
                Udyog Vihar Phase V
                <br />
                Gurgaon, Haryana
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="site-footer-brand">
          <div className="site-footer-logo-badge">
            <img src="/logo-orange.png" alt="Bouut Music" className="site-footer-logo" />
          </div>
          <p>&copy; 2026 Bouut Music. All rights reserved.</p>
        </div>

        <div className="site-footer-social-wrap">
          <span className="site-footer-visit">Visit Us</span>
          <div className="site-footer-socials">
            {socialLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="site-footer-social"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
