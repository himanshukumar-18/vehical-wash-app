/**
 * THE BLACK WASH — Legal Website Configuration
 *
 * ⚠️  BEFORE PRODUCTION DEPLOYMENT:
 * Replace every CONFIGURE_ME placeholder with real business information.
 * These values are used across all legal pages and the contact page.
 *
 * Lines marked with [REQUIRED] must be filled before going live.
 * Lines marked with [OPTIONAL] can remain empty if not applicable.
 */

export const legalConfig = {
  // ─────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────
  brandName: 'THE BLACK WASH',
  tagline: 'Your Car. Our Care.',
  appName: 'The Black Wash',
  serviceArea: 'Hazaribagh, Jharkhand, India',

  // ─────────────────────────────────────────
  // Contact Information  [REQUIRED before launch]
  // ─────────────────────────────────────────

  /** [REQUIRED] Primary support email — visible on Contact and legal pages */
  supportEmail: 'contact@theblackwash.com',

  /**
   * [REQUIRED] WhatsApp number in international format: +91XXXXXXXXXX
   * Leave empty string '' if not ready to publish publicly.
   */
  whatsappNumber: '',

  /**
   * [OPTIONAL] Phone number in readable format: +91 XXXXX XXXXX
   * Leave empty string '' to hide from Contact page.
   */
  supportPhone: '',

  /**
   * [OPTIONAL] Physical business address.
   * Leave empty string '' to hide from Contact page.
   */
  businessAddress: 'Hazaribagh, Jharkhand, India',

  // ─────────────────────────────────────────
  // Legal document revision dates
  // ─────────────────────────────────────────

  /**
   * [REQUIRED] Update this date ONLY when the Privacy Policy is revised.
   * Format: "Month DD, YYYY"  e.g. "September 30, 2026"
   */
  privacyLastUpdated: 'September 30, 2026',

  /**
   * [REQUIRED] Update this date ONLY when Terms of Service is revised.
   * Format: "Month DD, YYYY"
   */
  termsLastUpdated: 'September 30, 2026',

  // ─────────────────────────────────────────
  // Website / Domain
  // ─────────────────────────────────────────

  /**
   * [REQUIRED] Full production URL without trailing slash.
   * Example: "https://legal.theblackwash.com"
   * Used for canonical URLs and Open Graph.
   */
  siteUrl: 'https://theblackwash.vercel.app',

  // ─────────────────────────────────────────
  // Working hours (shown on Contact page)
  // ─────────────────────────────────────────
  workingHours: '8:00 AM – 7:00 PM (All Days)',
};

export default legalConfig;
