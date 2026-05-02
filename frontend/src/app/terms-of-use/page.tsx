'use client';

export default function TermsOfUsePage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#e6e5dd', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 840, width: '100%', padding: '0 24px', fontFamily: 'var(--font-sans), sans-serif' }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, color: '#ffffff' }}>Terms & Conditions</h1>
            <p style={{ color: '#9b918d', marginBottom: 48, fontSize: 14 }}>Last Updated: May 1, 2026</p>
            
            <div style={{ lineHeight: 1.8, fontSize: 16, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
                <div>Welcome to Bouut Music. By accessing or using our website, services, or platform, you agree to comply with and be bound by the following Terms & Conditions.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>1. Introduction</h2>
                <div>Bouut Music provides music promotion, distribution, marketing, and related services for artists, producers, and creators.<br/>
                   By using our services, you confirm that you have read, understood, and agreed to these terms.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>2. Eligibility</h2>
                <div>You must be at least 18 years old to use our services.<br/>
                   By using Bouut Music, you confirm that:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>You own or have rights to the content you submit</li>
                       <li>You have authority to enter into this agreement</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>3. Services</h2>
                <div>Bouut Music offers:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Music promotion</li>
                       <li>Artist branding & growth services</li>
                       <li>Music distribution</li>
                       <li>Marketing campaigns and audience engagement</li>
                       <li>Collaborations with producers, brands, reviewers, and creators</li>
                   </ul>
                   We reserve the right to modify or discontinue services at any time.
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>4. User Content</h2>
                <div>When you submit music, artwork, or any content:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>You retain ownership of your content</li>
                       <li>You grant Bouut Music a non-exclusive, worldwide, royalty-free license to:
                           <ul style={{ marginLeft: 24, marginTop: 4 }}>
                               <li>Promote your content</li>
                               <li>Share it on social media and website</li>
                               <li>Use it for marketing purposes</li>
                           </ul>
                       </li>
                   </ul>
                   You are responsible for ensuring your content:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Does not infringe copyrights</li>
                       <li>Does not violate any laws</li>
                       <li>Is not offensive, abusive, or misleading</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>5. Payments & Pricing</h2>
                <div>
                   All services are paid unless explicitly stated otherwise.<br/>
                   Prices are subject to change at any time.<br/>
                   Payments must be made in advance.<br/>
                   No guarantees on Streams, Followers, Virality.<br/>
                   <strong>Refund Policy:</strong> Payments are non-refundable once service has started. Refunds may be considered only in exceptional cases.
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>6. No Guarantees</h2>
                <div>Bouut Music does not guarantee:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Viral success</li>
                       <li>Specific reach, engagement, or growth</li>
                       <li>Record deals or monetization</li>
                   </ul>
                   We provide marketing and exposure, not guaranteed results.
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>7. Account Responsibility</h2>
                <div>
                   You are responsible for maintaining your account details.<br/>
                   Any activity under your account is your responsibility.<br/>
                   We can suspend or terminate accounts that: Violate terms, Abuse services, Engage in fraudulent activity.
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>8. Intellectual Property</h2>
                <div>All branding, logos, and platform content belong to Bouut Music. You may not copy, reproduce, or use our materials without permission.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>9. Third-Party Services</h2>
                <div>We may work with: Producers, Distributors, Marketing partners.<br/>
                   We are not responsible for: Third-party actions, External platform issues (Instagram, Spotify, etc.).
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>10. Termination</h2>
                <div>We reserve the right to: Refuse service to anyone, Remove content, Terminate accounts without prior notice.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>11. Limitation of Liability</h2>
                <div>Bouut Music is not liable for: Loss of revenue, Loss of followers or engagement, Platform algorithm changes, Any indirect or consequential damages.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>12. Changes to Terms</h2>
                <div>We may update these Terms at any time. Continued use of our services means you accept the updated terms.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>13. Contact</h2>
                <div>For any questions, contact:<br/>
                   Email: support@bouutmusic.com<br/>
                   Website: www.bouutmusic.com
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>14. Royalty & Commission Terms (For Distribution Services)</h2>
                <div>If you use Bouut Music for music distribution, Artists retain 100% ownership of their music and rights.<br/>
                   Bouut Music may charge: A fixed fee, OR A commission (%) on royalties, depending on the selected plan.<br/>
                   <strong>Royalty Collection:</strong> All revenue generated from platforms (Spotify, Apple Music, etc.) may be collected directly by the artist, OR collected via Bouut Music (if agreed).<br/>
                   <strong>Commission Structure:</strong> If commission-based: Bouut Music is entitled to 5% of net revenue. "Net revenue" means earnings after platform fees, taxes, and third-party charges.<br/>
                   <strong>Payouts:</strong> Payouts will be processed Monthly / Quarterly (based on plan). Minimum payout threshold may apply.<br/>
                   <strong>Transparency:</strong> Artists will have access to Earnings reports and Performance analytics.
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>15. Content Removal Policy</h2>
                <div>You may request content removal under the following conditions:<br/>
                   <strong>By the Artist:</strong> Artists can request removal of Music, Promotional posts, Campaign content.<br/>
                   <em>Conditions:</em> Requests must be sent via official email. Removal may take 3–10 business days. No refunds will be issued for completed promotions.<br/>
                   <strong>By Bouut Music:</strong> We reserve the right to remove content if it Violates copyright laws, Contains offensive, illegal, or harmful material, Damages our brand reputation, Violates platform guidelines (Instagram, Spotify, etc.).<br/>
                   <strong>Third-Party Platforms:</strong> We are not responsible for delays or failures in removal from Spotify, Instagram, YouTube. These depend on third-party processing times.
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>16. Campaign & Distribution Delivery Timeline</h2>
                <div>Bouut Music aims to deliver all promotional and distribution services within a reasonable timeframe. Timelines may vary depending on the service selected.</div>
                
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginTop: 16 }}>A. Promotion Campaign Timeline</h3>
                <div>
                   <strong>Start Time:</strong> Campaigns typically begin within 24–72 hours after Payment confirmation and Receipt of all required content.<br/>
                   <strong>Delivery Duration:</strong> Story posts: within 24–48 hours. Feed/Reel posts: within 2–5 business days. Full campaigns: as per agreed schedule.
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginTop: 16 }}>B. Music Distribution Timeline</h3>
                <div>
                   <strong>Submission Processing:</strong> Music submissions are reviewed within 24–72 hours, including: Metadata verification, Artwork approval, Content compliance checks.<br/>
                   <strong>Platform Delivery:</strong> Once approved, music is delivered to streaming platforms within 2–5 business days.<br/>
                   <strong>Release Planning:</strong> Artists are strongly advised to set a release date at least 7–14 days in advance. This ensures proper platform processing and better promotional opportunities.
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginTop: 16 }}>C. Possible Delays</h3>
                <div>Delays may occur due to Incorrect or incomplete submission details, Copyright or content-related issues, Delays from third-party platforms (Spotify, Apple Music, etc.), High demand or technical issues.<br/>
                   Bouut Music is not responsible for delays caused by third-party services.
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginTop: 16 }}>D. Artist Responsibility</h3>
                <div>To ensure timely delivery, artists must: Submit accurate and complete information, Provide high-quality audio and artwork, Respond promptly to any required changes. Failure to do so may result in delays.</div>

                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginTop: 16 }}>E. Revisions & Changes</h3>
                <div>Minor revisions may be requested before content goes live. Once published or distributed, changes may Not be possible, OR Require additional processing time.</div>

                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginTop: 16 }}>F. Urgent Requests</h3>
                <div>Expedited delivery may be available in select cases. Not guaranteed. Additional charges may apply.</div>

            </div>
        </div>
    </div>
  );
}
