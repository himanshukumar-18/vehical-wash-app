import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

const FOOTER_LINKS = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/account-deletion', label: 'Account & Data Deletion' },
  { to: '/contact', label: 'Contact' },
];

export default function LegalFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-icon" aria-hidden="true">B</div>
          <span className="footer-brand-name">The Black Wash</span>
        </div>
        <p className="footer-tagline">Your Car. Our Care.</p>

        <nav className="footer-links" aria-label="Footer navigation">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <hr className="footer-divider" />

        <p className="footer-copyright">
          &copy; {currentYear} The Black Wash. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
