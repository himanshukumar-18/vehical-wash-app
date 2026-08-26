import Link from "next/link";
import { ArrowLeft, CarFront, CheckCircle2, Shield, Wrench } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Terms & Conditions | The Black Wash Hazaribagh",
  description:
    "Terms and conditions for doorstep car wash and mobile detailing services provided by The Black Wash in Hazaribagh.",
  alternates: {
    canonical: `${siteConfig.url}/terms-and-conditions`,
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 px-4 sm:px-8 lg:px-12 max-w-[1100px] w-full mx-auto text-[#F5F7F8]">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#19C7F3] hover:text-[#0FA9D1] mb-8"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      {/* Header */}
      <div className="border-b border-[#26313A] pb-8 mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-[#19C7F3]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#19C7F3]">
            Legal & Customer Policy
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#F5F7F8]">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-sm text-[#A7B0B7] max-w-[700px] leading-relaxed">
          Please read these terms and conditions carefully before booking doorstep car wash and detailing services with The Black Wash.
        </p>
        <p className="mt-2 text-xs text-[#707A82]">
          Last Updated: August 2026
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-sm leading-relaxed text-[#A7B0B7]">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F5F7F8] tracking-[-0.02em] flex items-center gap-2">
            <span className="text-[#19C7F3]">1.</span> Service Description & Mobile Washing Model
          </h2>
          <p>
            <strong>The Black Wash</strong> operates a specialized mobile car wash and detailing service. Our fully equipped service van and team travel directly to the customer’s specified doorstep address to perform the requested vehicle cleaning and maintenance services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F5F7F8] tracking-[-0.02em] flex items-center gap-2">
            <span className="text-[#19C7F3]">2.</span> Booking Process & Preferred Date
          </h2>
          <p>
            When scheduling a booking online, customers select their vehicle type, desired wash service package, preferred service date, and exact doorstep address.
          </p>
          <p>
            Selecting a preferred service date does not guarantee immediate availability. All customer bookings are reviewed and confirmed manually by our service manager based on route planning and team capacity.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F5F7F8] tracking-[-0.02em] flex items-center gap-2">
            <span className="text-[#19C7F3]">3.</span> Manager Confirmation & Cancellation
          </h2>
          <p>
            A booking status remains <strong>Pending</strong> until approved by our manager. Upon review, the manager will confirm or decline the booking. If a booking is declined due to severe weather, unreachable location, or full scheduling capacity, any pre-paid amount will be fully refunded.
          </p>
          <p>
            Customers may request cancellation through their <em>My Bookings</em> portal prior to dispatch of the mobile washing team.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F5F7F8] tracking-[-0.02em] flex items-center gap-2">
            <span className="text-[#19C7F3]">4.</span> Pricing, Taxes & Payment Methods
          </h2>
          <p>
            All service prices displayed on our website are determined directly by our central pricing catalog. Applicable Taxes (GST at 18%) are calculated during checkout.
          </p>
          <p>We accept two payment methods:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
            <li><strong>Pay Online (Razorpay):</strong> Instant payment via UPI, Credit/Debit Cards, Net Banking, or Digital Wallets.</li>
            <li><strong>Pay at Counter / Cash:</strong> Payment directly to the mobile wash technician upon service completion.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F5F7F8] tracking-[-0.02em] flex items-center gap-2">
            <span className="text-[#19C7F3]">5.</span> Customer Responsibilities & Location Access
          </h2>
          <p>
            The customer is responsible for providing an accurate street address, contact phone number, and adequate parking space for both the customer's vehicle and the washing van.
          </p>
          <p>
            The customer must ensure legal permissions for our washing team to access gated communities, apartment complexes, or private driveways where applicable.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F5F7F8] tracking-[-0.02em] flex items-center gap-2">
            <span className="text-[#19C7F3]">6.</span> Liability & Vehicle Inspection
          </h2>
          <p>
            Our washing technicians perform a pre-wash visual inspection of the vehicle. Existing scratches, dented panels, faded paint, or loose accessories will be documented.
          </p>
          <p>
            The Black Wash is not liable for pre-existing vehicle damages or items left inside unlocked vehicles during the cleaning process.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F5F7F8] tracking-[-0.02em] flex items-center gap-2">
            <span className="text-[#19C7F3]">7.</span> Contact & Support
          </h2>
          <p>
            For questions regarding bookings, cancellations, or service inquiries, contact us at:
          </p>
          <div className="border border-[#26313A] bg-[#0D1115] p-4 text-xs space-y-1">
            <p><strong>The Black Wash Support Team</strong></p>
            <p>Email: <a href="mailto:hello@theblackwash.com" className="text-[#19C7F3] underline">hello@theblackwash.com</a></p>
            <p>Phone: +91 99999 99999</p>
          </div>
        </section>
      </div>

      {/* Footer link back */}
      <div className="mt-12 pt-8 border-t border-[#26313A] flex justify-between items-center text-xs text-[#707A82]">
        <p>© {new Date().getFullYear()} The Black Wash. All rights reserved.</p>
        <Link href="/" className="text-[#19C7F3] font-bold hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
