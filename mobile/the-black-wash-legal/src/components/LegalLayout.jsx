import LegalHeader from './LegalHeader';
import LegalFooter from './LegalFooter';
import BackToTop from './BackToTop';

export default function LegalLayout({ children, title, description }) {
  return (
    <div className="legal-layout">
      <LegalHeader />
      <main className="legal-main" id="main-content">
        {children}
      </main>
      <LegalFooter />
      <BackToTop />
    </div>
  );
}
