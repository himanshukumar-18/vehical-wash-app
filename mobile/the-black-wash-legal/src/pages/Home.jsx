import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';

const CARDS = [
  {
    to: '/privacy-policy',
    icon: '🔒',
    title: 'Privacy Policy',
    desc: 'How we collect, use, and protect your personal information in The Black Wash app.',
  },
  {
    to: '/terms',
    icon: '📋',
    title: 'Terms of Service',
    desc: 'The terms and conditions that govern your use of The Black Wash mobile application.',
  },
  {
    to: '/account-deletion',
    icon: '🗑️',
    title: 'Account & Data Deletion',
    desc: 'How to request deletion of your account and associated personal data.',
  },
  {
    to: '/contact',
    icon: '💬',
    title: 'Contact & Support',
    desc: 'Reach our support team for assistance with your account, bookings, or general enquiries.',
  },
];

export default function Home() {
  useEffect(() => {
    document.title = 'The Black Wash – Legal & Privacy';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Privacy Policy, Terms of Service, and support information for The Black Wash mobile application.');
  }, []);

  return (
    <LegalLayout>
      <div className="home-page">
        <div className="container">
          {/* Hero */}
          <section className="home-hero" aria-labelledby="home-title">
            <span className="home-hero-eyebrow">Legal &amp; Privacy Centre</span>
            <h1 className="home-hero-title" id="home-title">
              THE <span>BLACK WASH</span>
            </h1>
            <p className="home-hero-tagline">"Your Car. Our Care."</p>
            <p className="home-hero-sub">
              Premium doorstep car wash and car care booking — Hazaribagh, Jharkhand.
            </p>
            <div className="home-hero-actions">
              <Link to="/privacy-policy" className="btn btn-primary">
                🔒 Privacy Policy
              </Link>
              <Link to="/contact" className="btn btn-outline">
                💬 Contact Support
              </Link>
            </div>
          </section>

          {/* Navigation cards */}
          <section aria-label="Legal documents">
            <div className="legal-cards-grid">
              {CARDS.map((card) => (
                <Link key={card.to} to={card.to} className="legal-card">
                  <div className="legal-card-icon" aria-hidden="true">{card.icon}</div>
                  <div className="legal-card-title">{card.title}</div>
                  <div className="legal-card-desc">{card.desc}</div>
                  <div className="legal-card-arrow" aria-hidden="true">→</div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
