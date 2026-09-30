import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';
import { legalConfig } from '../data/legalContent';

export default function AccountDeletion() {
  useEffect(() => {
    document.title = 'The Black Wash – Account & Data Deletion';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'How to request deletion of your The Black Wash account and personal data.');
    window.scrollTo(0, 0);
  }, []);

  const { supportEmail, whatsappNumber, appName } = legalConfig;

  return (
    <LegalLayout>
      <div className="legal-page">
        <div className="container container--legal">
          {/* Page Header */}
          <div className="legal-hero">
            <div className="legal-badge">Account &amp; Data</div>
            <h1 className="legal-page-title">Account &amp; Data Deletion</h1>
          </div>

          {/* Intro */}
          <div className="legal-intro">
            <p>
              You have the right to request deletion of your <strong>{appName}</strong> account
              and the personal data associated with it. This page explains how to submit a
              deletion request and what to expect when one is processed.
            </p>
          </div>

          {/* How to Request */}
          <section className="legal-section" aria-labelledby="deletion-how">
            <h2 className="legal-section-title" id="deletion-how">How to Request Account Deletion</h2>
            <p>
              The Black Wash app does not currently include an in-app self-service "Delete Account"
              button. To request the deletion of your account and associated data, please contact
              our support team using one of the methods below:
            </p>

            <div className="deletion-step">
              <div className="deletion-step-num">1</div>
              <div className="deletion-step-body">
                <p>
                  <strong>Email us</strong> at{' '}
                  <a href={`mailto:${supportEmail}?subject=Account%20Deletion%20Request`}>
                    {supportEmail}
                  </a>{' '}
                  with the subject line: <em>"Account Deletion Request"</em>.
                </p>
              </div>
            </div>

            {whatsappNumber && (
              <div className="deletion-step">
                <div className="deletion-step-num">2</div>
                <div className="deletion-step-body">
                  <p>
                    <strong>Message us on WhatsApp</strong> at{' '}
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Account%20Deletion%20Request`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {whatsappNumber}
                    </a>{' '}
                    and state that you wish to delete your account.
                  </p>
                </div>
              </div>
            )}

            <div className="deletion-step">
              <div className="deletion-step-num">{whatsappNumber ? '3' : '2'}</div>
              <div className="deletion-step-body">
                <p>
                  <strong>Include the following in your request:</strong> the email address
                  registered with your account, and a clear statement that you are requesting
                  account deletion.
                </p>
              </div>
            </div>

            <div className="legal-note" style={{ marginTop: '16px' }}>
              <p>
                <strong>Processing time:</strong> We aim to process deletion requests within a
                reasonable timeframe. You will receive a confirmation once your request has been
                actioned.
              </p>
            </div>
          </section>

          <hr className="legal-separator" />

          {/* What Gets Deleted */}
          <section className="legal-section" aria-labelledby="deletion-what">
            <h2 className="legal-section-title" id="deletion-what">What Information Will Be Deleted</h2>
            <p>
              When your account deletion request is processed, we will delete or anonymise the
              following information associated with your account:
            </p>
            <ul>
              <li>Your account profile (name, email address, phone number)</li>
              <li>Your vehicle / garage information</li>
              <li>Your booking history records</li>
              <li>Your authentication credentials</li>
            </ul>
          </section>

          <hr className="legal-separator" />

          {/* What May Be Retained */}
          <section className="legal-section" aria-labelledby="deletion-retain">
            <h2 className="legal-section-title" id="deletion-retain">What Information May Be Retained</h2>
            <div className="legal-warning">
              <p>
                <strong>Important:</strong> Certain records may need to be retained even after your
                account deletion request is processed.
              </p>
            </div>
            <p>We may retain certain data where:</p>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Legal or Regulatory Obligations</h3>
              <p>
                We may be required by applicable law to retain certain records for a defined period,
                such as transaction records or correspondence relevant to dispute resolution.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Legitimate Business Purposes</h3>
              <p>
                Records necessary to prevent fraud, resolve existing disputes, enforce agreements,
                or address legitimate operational needs may be retained in an anonymised or
                pseudonymised form where possible.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Technical Backup Retention</h3>
              <p>
                Data may persist in backup systems for a short period following deletion from
                primary systems. Such data will be purged during normal backup rotation cycles.
              </p>
            </div>
          </section>

          <hr className="legal-separator" />

          {/* Effects of Deletion */}
          <section className="legal-section" aria-labelledby="deletion-effects">
            <h2 className="legal-section-title" id="deletion-effects">Effects of Account Deletion</h2>
            <p>Please be aware of the following consequences when you request account deletion:</p>
            <ul>
              <li>You will permanently lose access to your The Black Wash account.</li>
              <li>Your booking history and vehicle information will no longer be accessible.</li>
              <li>If you wish to use the App again in the future, you will need to register a new account.</li>
              <li>Any pending or confirmed bookings should be discussed with our team before requesting deletion.</li>
            </ul>
          </section>

          <hr className="legal-separator" />

          {/* Contact */}
          <section className="legal-section" aria-labelledby="deletion-contact">
            <h2 className="legal-section-title" id="deletion-contact">Contact for Deletion Requests</h2>
            <div className="legal-subsection">
              <p><strong>The Black Wash – Support</strong></p>
              <p>
                Email:{' '}
                <a href={`mailto:${supportEmail}?subject=Account%20Deletion%20Request`}>
                  {supportEmail}
                </a>
              </p>
              {whatsappNumber && (
                <p>
                  WhatsApp:{' '}
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {whatsappNumber}
                  </a>
                </p>
              )}
            </div>
            <p>
              For more information about how we handle your personal data, please read our{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
