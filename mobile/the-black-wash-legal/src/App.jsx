import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AccountDeletion from './pages/AccountDeletion';
import Contact from './pages/Contact';

function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '16px',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px' }}>🔍</div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F5F7FA' }}>Page Not Found</h1>
      <p style={{ color: '#A7B2C0', fontSize: '15px' }}>
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '8px',
          padding: '10px 22px',
          background: '#00CFFF',
          color: '#080B10',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '14px',
          textDecoration: 'none',
        }}
      >
        Go Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/account-deletion" element={<AccountDeletion />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
