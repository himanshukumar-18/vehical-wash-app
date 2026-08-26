"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const OWNER_WHATSAPP = "919999999999";

const companyLinks = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const serviceLinks = [
  { label: "Exterior Wash", href: "#" },
  { label: "Interior Cleaning", href: "#" },
  { label: "Full Car Detailing", href: "#" },
  { label: "Paint Protection", href: "#" },
  { label: "Premium Wash", href: "#" },
];

interface FooterNavProps {
  title: string;
  eyebrow: string;
  links: { label: string; href: string }[];
  ariaLabel: string;
}

const FooterNav: React.FC<FooterNavProps> = ({ title, eyebrow, links, ariaLabel }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
      {eyebrow}
    </p>

    <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">
      {title}
    </h3>

    <nav aria-label={ariaLabel} className="mt-6">
      <ul className="space-y-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="group inline-flex items-center gap-2 text-sm text-white/55 transition-colors duration-300 hover:text-white"
            >
              <span className="h-1 w-1 rounded-full bg-white/25 transition-all duration-300 group-hover:w-3 group-hover:bg-[var(--color-primary)]" />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);

const Footer = () => {
  const openWhatsApp = () => {
    window.open(`https://wa.me/${OWNER_WHATSAPP}`, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="bg-[#0D1115] px-5 pb-20 pt-14 text-white sm:px-8 sm:pb-8 sm:pt-20 lg:px-12 lg:pt-24">
      <div className="mx-auto max-w-[1400px]">
        {/* Top brand area */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.9fr_1fr] lg:gap-16">
          {/* Brand */}
          <div className="max-w-[420px]">
            <a
              href="#"
              aria-label="The Black Wash home"
              className="mb-2 inline-flex items-center gap-3 text-3xl font-extrabold tracking-[-0.06em]"
            >
              <span className="flex h-11 w-11 items-center justify-center bg-[var(--color-primary)] text-lg font-black text-[var(--color-black)]">
                BW
              </span>
              THE BLACK WASH
            </a>

            <p className="mt-6 max-w-[360px] text-sm leading-7 text-white/55 sm:text-base">
              Professional car wash and detailing designed to keep every
              vehicle clean, protected, and ready for the road.
            </p>

            <button
              type="button"
              onClick={openWhatsApp}
              className="group mt-7 inline-flex items-center gap-3 bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1ebe5d] hover:shadow-[0_12px_30px_rgba(37,211,102,0.18)]"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>

          <FooterNav
            eyebrow="Explore"
            title="Company"
            ariaLabel="Company navigation"
            links={companyLinks}
          />

          <FooterNav
            eyebrow="What We Do"
            title="Services"
            ariaLabel="Services navigation"
            links={serviceLinks}
          />

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
              Get In Touch
            </p>

            <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">
              Contact
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <MapPin size={17} className="mt-1 shrink-0 text-[var(--color-primary)]" />
                <address className="not-italic text-sm leading-6 text-white/55">
                  Your service center address,
                  <br />
                  City, State, India
                </address>
              </div>

              <a
                href="tel:+919999999999"
                className="flex items-center gap-3 text-sm text-white/55 transition-colors hover:text-white"
              >
                <Phone size={17} className="text-[var(--color-primary)]" />
                +91 99999 99999
              </a>

              <a
                href="mailto:hello@theblackwash.com"
                className="flex items-center gap-3 break-all text-sm text-white/55 transition-colors hover:text-white"
              >
                <Mail size={17} className="shrink-0 text-[var(--color-primary)]" />
                hello@theblackwash.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col mt-10 gap-4 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The Black Wash. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms-and-conditions" className="transition-colors hover:text-white">Terms & Conditions</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-white">Privacy Policy</Link>
            <a href="#contact" className="transition-colors hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;