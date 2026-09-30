import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';
import { legalConfig } from '../data/legalContent';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'The Black Wash – Privacy Policy';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Privacy Policy for The Black Wash mobile application.');
    window.scrollTo(0, 0);
  }, []);

  const { supportEmail, privacyLastUpdated, appName, serviceArea } = legalConfig;

  return (
    <LegalLayout>
      <div className="legal-page">
        <div className="container container--legal">
          {/* Page Header */}
          <div className="legal-hero">
            <div className="legal-badge">Privacy Policy</div>
            <h1 className="legal-page-title">Privacy Policy</h1>
            <p className="legal-last-updated">
              <span aria-hidden="true">📅</span>
              Last Updated: <strong>{privacyLastUpdated}</strong>
            </p>
          </div>

          {/* Introduction */}
          <div className="legal-intro">
            <p>
              This Privacy Policy describes how <strong>The Black Wash</strong> ("we", "us", or "our")
              collects, uses, and handles your personal information when you use the{' '}
              <strong>{appName}</strong> mobile application ("the App"). Please read this policy
              carefully before using the App.
            </p>
            <p style={{ marginTop: '10px', marginBottom: 0 }}>
              By registering an account or using the App, you acknowledge that you have read and
              understood this Privacy Policy.
            </p>
          </div>

          {/* 1. Information We Collect */}
          <section className="legal-section" aria-labelledby="section-collect">
            <h2 className="legal-section-title" id="section-collect">1. Information We Collect</h2>
            <p>
              We collect only the information that is necessary to provide the App's features and
              services. We do not collect information you have not provided to us.
            </p>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul>
                <li>Full name</li>
                <li>Email address (used for account registration, login, and OTP verification)</li>
                <li>Phone number (optionally provided for booking communication)</li>
                <li>Authentication credentials (passwords are never stored in plain text)</li>
              </ul>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Vehicle Information</h3>
              <p>
                When you add a vehicle to your garage, we collect the details you enter, which may
                include:
              </p>
              <ul>
                <li>Vehicle brand and model</li>
                <li>Vehicle registration number</li>
                <li>Vehicle type and colour</li>
              </ul>
              <p>This information is used to personalise your booking experience.</p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Booking Information</h3>
              <p>When you submit a booking request, we collect:</p>
              <ul>
                <li>Selected wash service</li>
                <li>Preferred booking date</li>
                <li>Doorstep address (provided by you for service delivery)</li>
                <li>Google Maps location link (optional, provided by you to assist service delivery)</li>
                <li>Contact phone number for booking dispatch (optional)</li>
                <li>Special instructions or notes (optional)</li>
                <li>Booking status and history</li>
              </ul>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Communication Information</h3>
              <p>
                The App facilitates a WhatsApp handoff for booking communication. When you tap the
                booking button, a pre-formatted message containing your booking details is prepared
                and opened in WhatsApp for you to send to our team. The contents of WhatsApp
                conversations are governed by WhatsApp's own privacy policy and are not stored by
                our App directly.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Technical Information</h3>
              <p>
                To support secure authentication and session management, the App stores authentication
                tokens securely on your device using the platform's secure storage mechanisms.
                We do not collect device identifiers, advertising IDs, precise GPS location,
                contacts, camera, microphone access, or biometric data.
              </p>
            </div>
          </section>

          <hr className="legal-separator" />

          {/* 2. How We Use Information */}
          <section className="legal-section" aria-labelledby="section-use">
            <h2 className="legal-section-title" id="section-use">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your user account</li>
              <li>Authenticate your identity and maintain a secure session</li>
              <li>Store and manage your vehicle details in your personal garage</li>
              <li>Process and communicate booking requests for doorstep car wash services</li>
              <li>Facilitate booking communication through WhatsApp</li>
              <li>Display your booking history and account information within the App</li>
              <li>Allow you to update your profile information</li>
              <li>Provide customer support when you contact us</li>
              <li>Maintain the security and reliability of the App</li>
              <li>Improve the performance and features of the App over time</li>
            </ul>
            <div className="legal-note">
              <p>
                <strong>Note:</strong> The App does not currently include online payment processing.
                Payments are handled directly between the customer and the service provider upon
                completion of the doorstep wash.
              </p>
            </div>
          </section>

          <hr className="legal-separator" />

          {/* 3. How We Share Information */}
          <section className="legal-section" aria-labelledby="section-share">
            <h2 className="legal-section-title" id="section-share">3. How We Share Your Information</h2>
            <p>
              We do not sell your personal information to third parties. We may share information in
              the following limited circumstances:
            </p>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Service Delivery</h3>
              <p>
                Your booking details, including your name, vehicle information, address, and service
                selection, may be shared with the service operator (The Black Wash business team)
                who fulfils your doorstep car wash booking.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">WhatsApp Communication</h3>
              <p>
                When you choose to send your booking via WhatsApp, your booking details are included
                in the message. WhatsApp is a third-party service operated by Meta Platforms, Inc.,
                and their own privacy policy applies to all WhatsApp communications.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Infrastructure Providers</h3>
              <p>
                We use third-party infrastructure services (such as hosting providers) to operate our
                backend systems. These providers may have access to your data solely for the purpose
                of providing technical services and are required to keep your data secure.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Legal Requirements</h3>
              <p>
                We may disclose your information where required by law, court order, or other legal
                processes, or where we believe disclosure is necessary to protect the rights, property,
                or safety of The Black Wash, our users, or others.
              </p>
            </div>
          </section>

          <hr className="legal-separator" />

          {/* 4. Data Storage and Security */}
          <section className="legal-section" aria-labelledby="section-security">
            <h2 className="legal-section-title" id="section-security">4. Data Storage and Security</h2>
            <p>
              We implement reasonable technical and organisational measures to protect your personal
              information against unauthorised access, alteration, disclosure, or destruction. These
              measures include:
            </p>
            <ul>
              <li>Authentication tokens stored securely on your device using platform-level secure storage</li>
              <li>Encrypted communication between the App and our backend servers (HTTPS/TLS)</li>
              <li>Access controls limiting who can access your personal data</li>
              <li>JWT-based authentication with token rotation and expiry</li>
            </ul>
            <div className="legal-warning">
              <p>
                <strong>Important:</strong> No method of electronic transmission or storage is
                completely secure. While we strive to protect your information using commercially
                reasonable measures, we cannot guarantee its absolute security.
              </p>
            </div>
          </section>

          <hr className="legal-separator" />

          {/* 5. Data Retention */}
          <section className="legal-section" aria-labelledby="section-retention">
            <h2 className="legal-section-title" id="section-retention">5. Data Retention</h2>
            <p>
              We retain your personal information only for as long as reasonably necessary to fulfil
              the purposes for which it was collected, including:
            </p>
            <ul>
              <li>Maintaining your active account and providing App features</li>
              <li>Keeping records of your bookings and service history</li>
              <li>Complying with applicable legal, regulatory, or operational obligations</li>
              <li>Resolving disputes and enforcing our agreements</li>
            </ul>
            <p>
              When you request deletion of your account, we will delete or anonymise your personal
              information to the extent permitted by applicable law. Certain records may be retained
              where required by law or for legitimate business purposes such as fraud prevention and
              dispute resolution.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* 6. Account and Data Deletion */}
          <section className="legal-section" aria-labelledby="section-deletion">
            <h2 className="legal-section-title" id="section-deletion">6. Account and Data Deletion</h2>
            <p>
              You have the right to request deletion of your The Black Wash account and associated
              personal data. Please visit our{' '}
              <Link to="/account-deletion">Account &amp; Data Deletion</Link> page for full
              instructions on how to submit a deletion request.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* 7. Children's Privacy */}
          <section className="legal-section" aria-labelledby="section-children">
            <h2 className="legal-section-title" id="section-children">7. Children's Privacy</h2>
            <p>
              The Black Wash application is intended for use by adults aged 18 years and older.
              We do not knowingly collect personal information from children under the age of 18.
              If you believe that a child under 18 has provided us with personal information, please
              contact us at <a href={`mailto:${supportEmail}`}>{supportEmail}</a> and we will take
              appropriate steps to remove that information.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* 8. Third-Party Services */}
          <section className="legal-section" aria-labelledby="section-third-party">
            <h2 className="legal-section-title" id="section-third-party">8. Third-Party Services</h2>
            <p>
              The App and its associated legal website interact with the following third-party
              services:
            </p>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">WhatsApp (Meta Platforms, Inc.)</h3>
              <p>
                Used for booking communication when the user chooses to initiate a WhatsApp
                conversation. WhatsApp's{' '}
                <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>{' '}
                governs their handling of communications.
              </p>
            </div>

            <div className="legal-subsection">
              <h3 className="legal-subsection-title">Vercel</h3>
              <p>
                Our legal and privacy website is hosted on Vercel, Inc. Vercel may process technical
                data such as IP addresses for the purpose of delivering the website. See Vercel's{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>{' '}
                for details.
              </p>
            </div>

            <p>
              We do not use Google Analytics, advertising trackers, or any analytics platform within
              the App or this website.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* 9. Changes to This Policy */}
          <section className="legal-section" aria-labelledby="section-changes">
            <h2 className="legal-section-title" id="section-changes">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, or applicable legal requirements. When we make material changes, we will
              update the "Last Updated" date at the top of this page.
            </p>
            <p>
              We encourage you to review this Privacy Policy periodically. Continued use of the App
              after changes have been published constitutes your acceptance of the updated policy.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* 10. Contact Us */}
          <section className="legal-section" aria-labelledby="section-contact">
            <h2 className="legal-section-title" id="section-contact">10. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests relating to this Privacy Policy or
              your personal data, please contact us at:
            </p>
            <div className="legal-subsection">
              <p><strong>The Black Wash</strong></p>
              <p>{serviceArea}</p>
              <p>
                Email:{' '}
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </p>
            </div>
            <p>
              For account or data deletion requests, please visit our{' '}
              <Link to="/account-deletion">Account &amp; Data Deletion</Link> page.
            </p>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
