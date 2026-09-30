import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms' },
  { to: '/account-deletion', label: 'Account Deletion' },
  { to: '/contact', label: 'Contact' },
];

export default function LegalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <Link to="/" className="header-brand" aria-label="The Black Wash – Home">
          <div className="header-brand-icon" aria-hidden="true">B</div>
          <span className="header-brand-name">The Black Wash</span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `header-nav-link${isActive ? ' active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="header-menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile navigation drawer */}
      <nav
        id="mobile-nav"
        className={`header-mobile-nav${menuOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `header-nav-link${isActive ? ' active' : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
