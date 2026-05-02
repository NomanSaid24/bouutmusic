'use client';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#e6e5dd', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 840, width: '100%', padding: '0 24px', fontFamily: 'var(--font-sans), sans-serif' }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, color: '#ffffff' }}>Privacy Policy</h1>
            <p style={{ color: '#9b918d', marginBottom: 48, fontSize: 14 }}>Effective Date: May 1, 2026<br/>Last Updated: May 1, 2026</p>
            
            <div style={{ lineHeight: 1.8, fontSize: 16, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
                <div>Welcome to Bouut Music. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us. By using our platform, you agree to the terms outlined in this Privacy Policy.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>1. Information We Collect</h2>
                
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginTop: 16 }}>a. Personal Information</h3>
                <div>We may collect the following personal details when you: Register on our website, Submit music or apply for promotion, Contact us directly.<br/>
                   This may include: Name, Email address, Phone number (if provided), Social media handles, Payment details (processed securely via third-party providers).
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginTop: 16 }}>b. Non-Personal Information</h3>
                <div>We may automatically collect: IP address, Browser type, Device information, Pages visited and time spent on site.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>2. How We Use Your Information</h2>
                <div>We use the information we collect to:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Provide and manage our services</li>
                       <li>Process payments and transactions</li>
                       <li>Promote artists and content</li>
                       <li>Communicate updates, offers, and support</li>
                       <li>Improve website functionality and user experience</li>
                       <li>Prevent fraud and ensure security</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>3. Sharing of Information</h2>
                <div>We do not sell your personal data.<br/>
                   We may share your information with:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Trusted third-party service providers (payment processors, analytics tools)</li>
                       <li>Legal authorities if required by law</li>
                       <li>Partners or collaborators (only when necessary for service delivery)</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>4. Cookies & Tracking Technologies</h2>
                <div>We use cookies and similar technologies to: Enhance user experience, Track website performance, Analyze traffic.<br/>
                   You can disable cookies through your browser settings, but this may affect site functionality.
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>5. Data Security</h2>
                <div>We implement appropriate technical and organizational measures to protect your data. However, no system is 100% secure, and we cannot guarantee absolute security.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>6. Data Retention</h2>
                <div>We retain your information only as long as necessary to: Provide services, Comply with legal obligations, Resolve disputes.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>7. Your Rights</h2>
                <div>Depending on your location, you may have the right to:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Access your personal data</li>
                       <li>Request correction or deletion</li>
                       <li>Withdraw consent</li>
                       <li>Object to data processing</li>
                   </ul>
                   To exercise your rights, contact us at: support@bouutmusic.com
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>8. Third-Party Links</h2>
                <div>Our website may contain links to third-party platforms. We are not responsible for their privacy practices. Please review their policies separately.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>9. Children’s Privacy</h2>
                <div>Our services are not intended for individuals under the age of 13 (or applicable age in your jurisdiction). We do not knowingly collect data from children.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>10. Changes to This Policy</h2>
                <div>We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised date.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>11. Contact Us</h2>
                <div>If you have any questions about this Privacy Policy, you can contact us at:<br/>
                   Email: support@bouutmusic.com<br/>
                   Website: www.bouutmusic.com
                </div>
            </div>
        </div>
    </div>
  );
}
