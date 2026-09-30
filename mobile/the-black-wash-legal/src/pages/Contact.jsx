import { useEffect } from 'react';
import LegalLayout from '../components/LegalLayout';
import { legalConfig } from '../data/legalContent';

export default function Contact() {
  useEffect(() => {
    document.title = 'The Black Wash – Contact & Support';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Contact The Black Wash support team for help with your account, bookings, or general enquiries.');
    window.scrollTo(0, 0);
  }, []);

  const {
    supportEmail,
    whatsappNumber,
    supportPhone,
    businessAddress,
    workingHours,
    serviceArea,
  } = legalConfig;

  const hasPhone = supportPhone && supportPhone.trim() !== '';
  const hasWhatsApp = whatsappNumber && whatsappNumber.trim() !== '';
  const hasAddress = businessAddress && businessAddress.trim() !== '';

  return (
    <LegalLayout>
      <div className="legal-page">
        <div className="container container--legal">
          {/* Page Header */}
          <div className="legal-hero">
            <div className="legal-badge">Contact &amp; Support</div>
            <h1 className="legal-page-title">Contact &amp; Support</h1>
          </div>

          {/* Intro */}
          <div className="legal-intro">
            <p>
              Have a question about your booking, account, or a service? We're here to help.
              Reach The Black Wash support team using any of the channels below.
            </p>
          </div>

          {/* Contact cards */}
          <section aria-label="Contact details">
            <div className="contact-grid">
              {/* Email — always shown */}
              <div className="contact-card">
                <div className="contact-card-icon" aria-hidden="true">✉️</div>
                <div className="contact-card-body">
                  <p className="contact-card-label">Email Support</p>
                  <p className="contact-card-value">
                    <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                  </p>
                </div>
              </div>

              {/* WhatsApp — only if configured */}
              {hasWhatsApp && (
                <div className="contact-card">
                  <div className="contact-card-icon" aria-hidden="true">💬</div>
                  <div className="contact-card-body">
                    <p className="contact-card-label">WhatsApp</p>
                    <p className="contact-card-value">
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {whatsappNumber}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Phone — only if configured */}
              {hasPhone && (
                <div className="contact-card">
                  <div className="contact-card-icon" aria-hidden="true">📞</div>
                  <div className="contact-card-body">
                    <p className="contact-card-label">Phone</p>
                    <p className="contact-card-value">
                      <a href={`tel:${supportPhone.replace(/\s/g, '')}`}>{supportPhone}</a>
                    </p>
                  </div>
                </div>
              )}

              {/* Address — only if configured */}
              {hasAddress && (
                <div className="contact-card">
                  <div className="contact-card-icon" aria-hidden="true">📍</div>
                  <div className="contact-card-body">
                    <p className="contact-card-label">Service Area</p>
                    <p className="contact-card-value">{businessAddress}</p>
                  </div>
                </div>
              )}

              {/* Working hours */}
              <div className="contact-card">
                <div className="contact-card-icon" aria-hidden="true">🕐</div>
                <div className="contact-card-body">
                  <p className="contact-card-label">Working Hours</p>
                  <p className="contact-card-value">{workingHours}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Note */}
          <div className="contact-note" role="note">
            <p>
              For account or data deletion requests, please visit our{' '}
              <a href="/account-deletion">Account &amp; Data Deletion</a> page for full
              instructions. For booking-related issues, please reach out via WhatsApp or email
              and include your booking reference if you have one.
            </p>
          </div>

          {/* Common queries */}
          <section className="legal-section" style={{ marginTop: '32px' }} aria-labelledby="contact-topics">
            <h2 className="legal-section-title" id="contact-topics">Common Enquiries</h2>
            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Booking Enquiries</h3>
              <p>
                For questions about an existing booking, new booking requests, or rescheduling,
                please contact us via WhatsApp{hasWhatsApp ? ` at ${whatsappNumber}` : ''} or
                email us at{' '}
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Account Issues</h3>
              <p>
                For login problems, account access issues, or profile updates, please email us
                at <a href={`mailto:${supportEmail}`}>{supportEmail}</a> with your registered
                email address.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Privacy &amp; Data Requests</h3>
              <p>
                For requests related to your personal data, including access requests or
                deletion requests, please visit our{' '}
                <a href="/account-deletion">Account &amp; Data Deletion</a> page or email us
                at <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
