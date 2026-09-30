import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';
import { legalConfig } from '../data/legalContent';

export default function TermsOfService() {
  useEffect(() => {
    document.title = 'The Black Wash – Terms of Service';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Terms of Service for The Black Wash mobile application.');
    window.scrollTo(0, 0);
  }, []);

  const { supportEmail, termsLastUpdated, serviceArea } = legalConfig;

  return (
    <LegalLayout>
      <div className="legal-page">
        <div className="container container--legal">
          {/* Page Header */}
          <div className="legal-hero">
            <div className="legal-badge">Terms of Service</div>
            <h1 className="legal-page-title">Terms of Service</h1>
            <p className="legal-last-updated">
              <span aria-hidden="true">📅</span>
              Last Updated: <strong>{termsLastUpdated}</strong>
            </p>
          </div>

          {/* Intro */}
          <div className="legal-intro">
            <p>
              Please read these Terms of Service ("Terms") carefully before using{' '}
              <strong>The Black Wash</strong> mobile application ("the App"). By accessing or
              using the App, you agree to be bound by these Terms. If you do not agree with any
              part of these Terms, please do not use the App.
            </p>
          </div>

          {/* Section 1 */}
          <section className="legal-section" aria-labelledby="tos-1">
            <h2 className="legal-section-title" id="tos-1">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using The Black Wash application, you confirm that you are
              at least 18 years of age and that you agree to these Terms and our{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>. These Terms constitute a legally
              binding agreement between you and The Black Wash.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 2 */}
          <section className="legal-section" aria-labelledby="tos-2">
            <h2 className="legal-section-title" id="tos-2">2. About The Black Wash</h2>
            <p>
              The Black Wash is a doorstep car wash and car detailing service operating in{' '}
              <strong>{serviceArea}</strong>. Our mobile application allows customers to register
              an account, manage their vehicle details, and submit booking requests for doorstep
              car wash services. Booking communication and confirmation is handled by our team
              via WhatsApp.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 3 */}
          <section className="legal-section" aria-labelledby="tos-3">
            <h2 className="legal-section-title" id="tos-3">3. User Accounts</h2>
            <ul>
              <li>You must provide accurate and complete information when registering your account.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must notify us immediately if you suspect unauthorised use of your account.</li>
              <li>
                We reserve the right to suspend or terminate accounts that violate these Terms or
                are used fraudulently.
              </li>
            </ul>
          </section>

          <hr className="legal-separator" />

          {/* Section 4 */}
          <section className="legal-section" aria-labelledby="tos-4">
            <h2 className="legal-section-title" id="tos-4">4. User Responsibilities</h2>
            <p>When using the App, you agree to:</p>
            <ul>
              <li>Provide truthful and accurate information for your account, vehicle, and bookings.</li>
              <li>Ensure your vehicle and location details are correct at the time of booking.</li>
              <li>Be available or ensure that access is provided at the confirmed booking address during the service window.</li>
              <li>Use the App only for lawful purposes and in accordance with these Terms.</li>
              <li>Not use the App to submit false, misleading, or malicious booking requests.</li>
            </ul>
          </section>

          <hr className="legal-separator" />

          {/* Section 5 */}
          <section className="legal-section" aria-labelledby="tos-5">
            <h2 className="legal-section-title" id="tos-5">5. Vehicle Information</h2>
            <p>
              You are responsible for ensuring that the vehicle information you enter in your
              garage (brand, model, registration number, type) is accurate. Inaccurate vehicle
              information may affect the service we are able to provide. The Black Wash is not
              liable for service issues arising from incorrect vehicle information provided by
              the customer.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 6 */}
          <section className="legal-section" aria-labelledby="tos-6">
            <h2 className="legal-section-title" id="tos-6">6. Booking Process</h2>
            <p>
              The App allows you to submit a booking request for a doorstep car wash service.
              The booking process works as follows:
            </p>
            <ol>
              <li>Select your vehicle from your garage.</li>
              <li>Choose a wash package from the available services.</li>
              <li>Select a preferred booking date.</li>
              <li>Provide your doorstep address in Hazaribagh.</li>
              <li>Optionally provide a Google Maps link to assist with navigation.</li>
              <li>Submit the booking request, which opens WhatsApp with a pre-formatted message.</li>
              <li>Send the WhatsApp message to our team to initiate confirmation.</li>
            </ol>
          </section>

          <hr className="legal-separator" />

          {/* Section 7 */}
          <section className="legal-section" aria-labelledby="tos-7">
            <h2 className="legal-section-title" id="tos-7">7. Booking Requests and Confirmation</h2>
            <p>
              Submitting a booking request through the App does not guarantee an automatic
              booking confirmation. Bookings are confirmed by our team via WhatsApp after
              reviewing availability. We reserve the right to decline or reschedule a booking
              request at our discretion, particularly if the requested date or service is not
              available.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 8 */}
          <section className="legal-section" aria-labelledby="tos-8">
            <h2 className="legal-section-title" id="tos-8">8. WhatsApp Communication</h2>
            <p>
              Booking communication between customers and The Black Wash team is conducted via
              WhatsApp. By using the booking feature in the App, you consent to receiving
              booking-related communication from us on WhatsApp. The Black Wash is not
              responsible for any delays, interruptions, or privacy issues arising from the use
              of WhatsApp as a communication channel.
            </p>
            <p>
              WhatsApp is operated by Meta Platforms, Inc. and is subject to its own terms of
              service and privacy policy.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 9 */}
          <section className="legal-section" aria-labelledby="tos-9">
            <h2 className="legal-section-title" id="tos-9">9. Service Availability</h2>
            <p>
              Our doorstep car wash services are currently available in{' '}
              <strong>{serviceArea}</strong>. Service availability may vary depending on demand,
              weather conditions, public holidays, or other operational factors. We do not
              guarantee service availability at any specific time or on any specific date.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 10 */}
          <section className="legal-section" aria-labelledby="tos-10">
            <h2 className="legal-section-title" id="tos-10">10. Cancellation and Rescheduling</h2>
            <div className="legal-warning">
              <p>
                <strong>Note:</strong> Specific cancellation and rescheduling policies are managed
                directly between the customer and The Black Wash team via WhatsApp. Please contact
                us at <a href={`mailto:${supportEmail}`}>{supportEmail}</a> or on WhatsApp if you
                need to cancel or reschedule a confirmed booking.
              </p>
            </div>
            <p>
              We ask that customers provide reasonable notice where possible if they need to cancel
              or reschedule a confirmed booking.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 11 */}
          <section className="legal-section" aria-labelledby="tos-11">
            <h2 className="legal-section-title" id="tos-11">11. Pricing and Service Information</h2>
            <p>
              Service prices displayed in the App are indicative and subject to change. The final
              price applicable to your booking will be communicated and agreed during the WhatsApp
              confirmation process. Payment is made directly to the service provider upon
              completion of the doorstep wash (cash or UPI).
            </p>
            <div className="legal-note">
              <p>
                <strong>Note:</strong> The App does not currently process online payments. No
                payment information is collected or stored by the App.
              </p>
            </div>
          </section>

          <hr className="legal-separator" />

          {/* Section 12 */}
          <section className="legal-section" aria-labelledby="tos-12">
            <h2 className="legal-section-title" id="tos-12">12. Prohibited Use</h2>
            <p>You agree not to use the App to:</p>
            <ul>
              <li>Violate any applicable local, national, or international laws or regulations.</li>
              <li>Submit false, fraudulent, or misleading booking requests.</li>
              <li>Impersonate any person or entity.</li>
              <li>Attempt to gain unauthorised access to any part of the App or its backend systems.</li>
              <li>Disrupt or interfere with the App's operation or the experience of other users.</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of the App.</li>
              <li>Use the App for any commercial purpose other than as expressly permitted.</li>
            </ul>
          </section>

          <hr className="legal-separator" />

          {/* Section 13 */}
          <section className="legal-section" aria-labelledby="tos-13">
            <h2 className="legal-section-title" id="tos-13">13. Intellectual Property</h2>
            <p>
              All content, branding, designs, logos, text, and software within The Black Wash
              application are the property of The Black Wash and are protected by applicable
              intellectual property laws. You may not copy, reproduce, distribute, or create
              derivative works from any part of the App without our express written permission.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 14 */}
          <section className="legal-section" aria-labelledby="tos-14">
            <h2 className="legal-section-title" id="tos-14">14. Third-Party Services</h2>
            <p>
              The App interacts with third-party services including WhatsApp for booking
              communication. Your use of any third-party service is governed by that service's
              own terms and privacy policy. We are not responsible for the practices of any
              third-party service.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 15 */}
          <section className="legal-section" aria-labelledby="tos-15">
            <h2 className="legal-section-title" id="tos-15">15. Disclaimer</h2>
            <p>
              The Black Wash application and its services are provided on an "as is" and "as
              available" basis without warranties of any kind, either express or implied. We do
              not warrant that the App will be uninterrupted, error-free, or free of harmful
              components. We reserve the right to modify, suspend, or discontinue any part of
              the App at any time without notice.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 16 */}
          <section className="legal-section" aria-labelledby="tos-16">
            <h2 className="legal-section-title" id="tos-16">16. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, The Black Wash and its operators
              shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of or in connection with your use of the App or
              services, even if advised of the possibility of such damages.
            </p>
            <p>
              Our total liability to you for any claim arising out of or relating to these Terms
              or your use of the App shall not exceed the amount paid by you (if any) for the
              specific service giving rise to the claim.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 17 */}
          <section className="legal-section" aria-labelledby="tos-17">
            <h2 className="legal-section-title" id="tos-17">17. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. When we make material
              changes, we will update the "Last Updated" date at the top of this page. Continued
              use of the App after changes are published constitutes your acceptance of the
              updated Terms.
            </p>
          </section>

          <hr className="legal-separator" />

          {/* Section 18 */}
          <section className="legal-section" aria-labelledby="tos-18">
            <h2 className="legal-section-title" id="tos-18">18. Contact</h2>
            <p>
              If you have any questions or concerns about these Terms of Service, please contact
              us:
            </p>
            <div className="legal-subsection">
              <p><strong>The Black Wash</strong></p>
              <p>{serviceArea}</p>
              <p>
                Email: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
