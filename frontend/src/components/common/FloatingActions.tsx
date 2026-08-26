"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUp,
    Car,
    Check,
    ChevronRight,
    Loader2,
    MapPin,
    MessageCircle,
    Navigation,
    Phone,
    User,
    X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Replace with real WhatsApp number: country code + number, no + or spaces
const OWNER_WHATSAPP = "919999999999";
const WHATSAPP_PREFIX = "Hello THE BLACK WASH! I would like to book a car wash service.";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingForm {
    personName: string;
    phoneNumber: string;
    carName: string;
    carNumber: string;
    location: string;
    googleMapsLink: string;
}

type FormErrors = Partial<Record<keyof BookingForm, string>>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_FORM: BookingForm = {
    personName: "",
    phoneNumber: "",
    carName: "",
    carNumber: "",
    location: "",
    googleMapsLink: "",
};

const LABEL_CLASS =
    "mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text)]";

const ERROR_CLASS = "mt-1 text-[10px] text-red-400";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const panelVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.96 },
};

const popVariants = {
    hidden: { opacity: 0, scale: 0.7, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.7, y: 15 },
};

const transition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

// ---------------------------------------------------------------------------
// FloatingActions
// ---------------------------------------------------------------------------

export default function FloatingActions() {
    const [showTopBtn, setShowTopBtn] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [form, setForm] = useState<BookingForm>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});

    // -------------------------------------------------------------------------
    // Scroll watcher — show back-to-top after 350px
    // -------------------------------------------------------------------------

    useEffect(() => {
        const onScroll = () => setShowTopBtn(window.scrollY > 350);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // -------------------------------------------------------------------------
    // Form helpers
    // -------------------------------------------------------------------------

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const clearError = (field: keyof BookingForm) =>
        setErrors(prev => ({ ...prev, [field]: "" }));

    // -------------------------------------------------------------------------
    // Geolocation
    // -------------------------------------------------------------------------

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Location access is not supported by your browser.");
            return;
        }

        setGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const { latitude, longitude } = coords;
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

                setForm(prev => ({
                    ...prev,
                    location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                    googleMapsLink: mapsLink,
                }));

                clearError("location");
                clearError("googleMapsLink");
                setGettingLocation(false);
            },
            () => {
                setGettingLocation(false);
                alert("Unable to get your location. Please allow location access and try again.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    const validate = (): boolean => {
        const next: FormErrors = {};

        if (!form.personName.trim())
            next.personName = "Name is required";

        if (!form.phoneNumber.trim())
            next.phoneNumber = "Phone number is required";
        else if (!/^[6-9]\d{9}$/.test(form.phoneNumber))
            next.phoneNumber = "Enter a valid 10-digit mobile number";

        if (!form.carName.trim())
            next.carName = "Car name is required";

        if (!form.carNumber.trim())
            next.carNumber = "Car number is required";

        if (!form.location.trim())
            next.location = "Location is required";

        if (!form.googleMapsLink.trim())
            next.googleMapsLink = "Google Maps location is required";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // -------------------------------------------------------------------------
    // WhatsApp booking
    // -------------------------------------------------------------------------

    const handleWhatsAppBooking = () => {
        if (!validate()) return;

        setSubmitting(true);

        const message = `
${WHATSAPP_PREFIX}

━━━━━━━━━━━━━━━━━━
BOOKING DETAILS
━━━━━━━━━━━━━━━━━━

👤 Name       : ${form.personName}
📞 Phone      : ${form.phoneNumber}
🚗 Car        : ${form.carName}
🔢 Car Number : ${form.carNumber}
📍 Location   : ${form.location}
🗺️ Maps       : ${form.googleMapsLink}

━━━━━━━━━━━━━━━━━━
Please confirm my booking. Thank you!
`.trim();

        // Small delay for loading state feedback before redirect
        setTimeout(() => {
            window.location.href = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
        }, 400);
    };

    // -------------------------------------------------------------------------
    // Input class helper
    // -------------------------------------------------------------------------

    const inputClass = (field: keyof BookingForm) =>
        [
            "h-11 w-full border bg-[#0D1115] px-3.5 text-sm",
            "text-[var(--color-heading)] placeholder:text-[var(--color-text-light)]",
            "outline-none transition-all duration-200",
            errors[field] ? "border-red-400/70" : "border-[var(--color-border)]",
            "focus:border-[var(--color-primary)]",
        ].join(" ");

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">

            {/* ================================================================
          BOOKING PANEL
      ================================================================ */}
            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={transition}
                        className="w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden border border-[var(--color-border)] bg-[#080A0C] shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-[var(--color-divider)] px-4 py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                                        Quick Booking
                                    </span>
                                </div>
                                <h3 className="mt-1.5 font-heading text-lg font-semibold tracking-tight text-[var(--color-heading)]">
                                    Book your wash
                                </h3>
                                <p className="mt-1 text-[11px] text-[var(--color-text-light)]">
                                    Fill in your details and continue on WhatsApp.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setChatOpen(false)}
                                aria-label="Close booking form"
                                className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--color-border)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Form body */}
                        <div className="max-h-[70vh] overflow-y-auto p-4">

                            {/* Name */}
                            <Field label="Your Name" icon={<User size={12} />} error={errors.personName}>
                                <input
                                    id="personName"
                                    name="personName"
                                    type="text"
                                    value={form.personName}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className={inputClass("personName")}
                                />
                            </Field>

                            {/* Phone */}
                            <Field label="Phone Number" icon={<Phone size={12} />} error={errors.phoneNumber}>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    className={inputClass("phoneNumber")}
                                />
                            </Field>

                            {/* Car name */}
                            <Field label="Car Name / Model" icon={<Car size={12} />} error={errors.carName}>
                                <input
                                    id="carName"
                                    name="carName"
                                    type="text"
                                    value={form.carName}
                                    onChange={handleChange}
                                    placeholder="e.g. Hyundai Creta"
                                    className={inputClass("carName")}
                                />
                            </Field>

                            {/* Car number */}
                            <Field label="Car Number" icon={<span className="text-[11px]">#</span>} error={errors.carNumber}>
                                <input
                                    id="carNumber"
                                    name="carNumber"
                                    type="text"
                                    value={form.carNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. JH02AB1234"
                                    className={inputClass("carNumber")}
                                />
                            </Field>

                            {/* Location with GPS button */}
                            <Field label="Location" icon={<MapPin size={12} />} error={errors.location}>
                                <div className="relative">
                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="Enter your location"
                                        className={`${inputClass("location")} pr-28`}
                                    />
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={gettingLocation}
                                        className="absolute right-1 top-1 flex h-9 items-center gap-1.5 bg-[var(--color-primary)]/10 px-2.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/20 disabled:opacity-50"
                                    >
                                        {gettingLocation
                                            ? <><Loader2 size={12} className="animate-spin" /> Locating</>
                                            : <><Navigation size={12} /> Use GPS</>
                                        }
                                    </button>
                                </div>
                            </Field>

                            {/* Google Maps link */}
                            <Field
                                label="Google Maps Location"
                                icon={<Navigation size={12} />}
                                error={errors.googleMapsLink}
                                hint="Use 'Use GPS' above to auto-fill this field."
                                className="mb-4"
                            >
                                <input
                                    id="googleMapsLink"
                                    name="googleMapsLink"
                                    type="url"
                                    value={form.googleMapsLink}
                                    onChange={handleChange}
                                    placeholder="https://maps.google.com/..."
                                    className={inputClass("googleMapsLink")}
                                />
                            </Field>

                            {/* Submit */}
                            <button
                                type="button"
                                onClick={handleWhatsAppBooking}
                                disabled={submitting}
                                className="group flex h-12 w-full items-center justify-center gap-2 bg-[var(--color-primary)] text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-black)] transition-all duration-300 hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Opening WhatsApp...
                                    </>
                                ) : (
                                    <>
                                        <MessageCircle size={17} />
                                        Continue on WhatsApp
                                        <ChevronRight
                                            size={15}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>

                            <p className="mt-3 text-center text-[9px] leading-4 text-[var(--color-text-light)]">
                                Your booking details will be sent directly to THE BLACK WASH on WhatsApp.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================================================================
          WHATSAPP TOGGLE BUTTON
      ================================================================ */}
            <motion.button
                type="button"
                onClick={() => setChatOpen(prev => !prev)}
                aria-label={chatOpen ? "Close WhatsApp booking" : "Open WhatsApp booking"}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-[#19C7F3] text-white shadow-[0_12px_35px_rgba(37,99,235,0.35)] sm:h-15 sm:w-15"
            >
                {/* Ping ring */}
                {!chatOpen && (
                    <span className="absolute inset-0 animate-ping rounded-full border border-white/30 opacity-20" />
                )}
                {chatOpen
                    ? <X size={21} className="relative z-10" />
                    : <MessageCircle size={23} className="relative z-10 transition-transform duration-300 group-hover:scale-110" />
                }
            </motion.button>

            {/* ================================================================
          BACK TO TOP
      ================================================================ */}
            <AnimatePresence>
                {showTopBtn && (
                    <motion.button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        aria-label="Back to top"
                        variants={popVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={transition}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-heading)] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:h-12 sm:w-12"
                    >
                        <ArrowUp
                            size={18}
                            className="transition-transform duration-300 group-hover:-translate-y-1"
                        />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Field — reusable form field wrapper
// ---------------------------------------------------------------------------

function Field({
    label,
    icon,
    error,
    hint,
    children,
    className = "mb-3",
}: {
    label: string;
    icon: React.ReactNode;
    error?: string;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className={LABEL_CLASS}>
                {icon}
                {label}
            </label>
            {children}
            {error && <p className={ERROR_CLASS}>{error}</p>}
            {hint && !error && (
                <p className="mt-1.5 text-[9px] leading-4 text-[var(--color-text-light)]">{hint}</p>
            )}
        </div>
    );
}