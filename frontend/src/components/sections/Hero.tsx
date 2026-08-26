"use client";

import Image from "next/image";
import { ArrowUpRight, Check, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useBooking } from "../../context/BookingProvider";
const FALLBACK_HERO_IMAGE = "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg";

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
});

const fadeIn = (delay = 0) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay, duration: 0.6 },
});

// ---------------------------------------------------------------------------
// Trust badges data
// ---------------------------------------------------------------------------

const TRUST_ITEMS = [
    {
        key: "care",
        label: "Professional Care",
        icon: (
            <span className="flex h-4 w-4 items-center justify-center border border-[var(--color-primary)]/50 sm:h-5 sm:w-5">
                <Check size={9} strokeWidth={2.5} className="text-[var(--color-primary)]" />
            </span>
        ),
    },
    {
        key: "location",
        label: "Hazaribagh",
        icon: <MapPin size={12} strokeWidth={1.8} className="text-[var(--color-primary)]" />,
    },
    {
        key: "booking",
        label: "Easy Booking",
        icon: <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />,
    },
];

const TRUST_LABEL_CLASS =
    "text-[8px] font-medium uppercase tracking-[0.1em] text-white/55 sm:text-[9px] sm:tracking-[0.12em]";

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

import { useSelector } from "react-redux";
import { selectPublicImages } from "../../lib/slices/imageSlice";
import { getDynamicImageSrc } from "../../lib/utils/imageUtils";

export default function Hero() {
    const { openBooking } = useBooking();
    const publicImages = useSelector(selectPublicImages);
    const heroImageSrc = getDynamicImageSrc(publicImages["home_hero"]) || FALLBACK_HERO_IMAGE;

    return (
        <section
            id="home"
            className={[
                "relative w-full overflow-hidden",
                "bg-[var(--color-page-bg)] text-[var(--color-heading)]",
                "h-[60vh] min-h-[500px]",
                "sm:h-[65vh] sm:min-h-[560px]",
                "md:h-screen md:min-h-screen",
            ].join(" ")}
        >
            {/* Background */}
            {heroImageSrc && (
                <Image
                    src={heroImageSrc}
                    alt="The Black Wash premium doorstep car wash and vehicle detailing service in Hazaribagh"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-[65%_center] sm:object-center"
                />
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-[#050708]/75" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050708]/95 via-[#050708]/70 to-[#050708]/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050708] via-transparent to-[#050708]/35" />

            {/* Ambient glow — off-screen on mobile, visible on sm+ */}
            <div className="absolute -right-24 top-[20%] h-[240px] w-[240px] rounded-full bg-[var(--color-primary)]/[0.07] blur-[100px] sm:right-[5%] sm:h-[320px] sm:w-[320px]" />

            {/* ================================================================
          CONTENT
      ================================================================ */}
            <div className="relative z-10 mx-auto flex h-full max-w-[1400px] items-center px-5 pb-8 pt-24 sm:px-8 sm:pb-12 sm:pt-28 lg:px-12">
                <div className="w-full max-w-[720px]">

                    {/* Eyebrow */}
                    <motion.div {...fadeUp(0)} className="mb-4 flex items-center gap-2.5 sm:mb-6 sm:gap-3">
                        <span className="h-px w-6 bg-[var(--color-primary)] sm:w-10" />
                        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] sm:text-[10px] sm:tracking-[0.25em] md:text-xs">
                            Doorstep Car Care · Hazaribagh
                        </span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        {...fadeUp(0.08)}
                        transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                        className="font-heading font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-[var(--color-heading)] text-[2.2rem] min-[360px]:text-[2.6rem] sm:text-[4.2rem] md:text-[6rem] lg:text-[7.5rem] xl:text-[8.5rem]"
                    >
                        Your Car.
                        <br />
                        <span className="text-[var(--color-primary)]">Our Craft.</span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        {...fadeUp(0.18)}
                        className="mt-4 max-w-[390px] text-xs leading-5 text-[var(--color-text)] sm:mt-6 sm:max-w-[480px] sm:text-sm sm:leading-6 md:text-base md:leading-7"
                    >
                        Premium car cleaning at your doorstep.
                        Simple booking. Professional care. Better shine.
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        {...fadeUp(0.28)}
                        className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3"
                    >
                        <button
                            type="button"
                            onClick={() => openBooking()}
                            className={[
                                "group inline-flex h-11 items-center justify-center gap-2.5",
                                "bg-[var(--color-primary)] px-5 sm:h-12 sm:px-6",
                                "text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-black)]",
                                "transition-all duration-300 hover:bg-[var(--color-primary-hover)]",
                                "active:scale-[0.98]",
                            ].join(" ")}
                        >
                            Book a Wash
                            <ArrowUpRight
                                size={15}
                                strokeWidth={2}
                                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </button>

                        <a
                            href="#services"
                            className={[
                                "group inline-flex h-11 items-center justify-center gap-3",
                                "border border-white/20 bg-white/[0.04] px-5 backdrop-blur-sm sm:h-12 sm:px-6",
                                "text-[10px] font-semibold uppercase tracking-[0.08em] text-white",
                                "transition-all duration-300 hover:border-white/40 hover:bg-white/[0.08]",
                                "active:scale-[0.98]",
                            ].join(" ")}
                        >
                            Explore Services
                            <span className="h-px w-4 bg-white/40 transition-all duration-300 group-hover:w-7 group-hover:bg-[var(--color-primary)]" />
                        </a>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        {...fadeIn(0.45)}
                        className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-7 sm:gap-x-6"
                    >
                        {TRUST_ITEMS.map((item, index) => (
                            <div key={item.key} className="flex items-center gap-1.5">
                                {/* Divider — only between items, only on sm+ */}
                                {index > 0 && (
                                    <span className="mr-1 hidden h-3 w-px bg-white/15 sm:block" />
                                )}
                                {item.icon}
                                <span className={TRUST_LABEL_CLASS}>{item.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ================================================================
          BOTTOM BRAND LINE — hidden on mobile to keep hero compact
      ================================================================ */}
            <motion.div
                {...fadeIn(0.65)}
                className={[
                    "absolute bottom-5 left-5 right-5 z-10",
                    "hidden items-center justify-between",
                    "border-t border-white/10 pt-3",
                    "sm:left-8 sm:right-8 sm:flex",
                    "lg:left-12 lg:right-12",
                ].join(" ")}
            >
                <span className="text-[8px] font-medium uppercase tracking-[0.25em] text-white/30">
                    THE BLACK WASH
                </span>
                <span className="text-[8px] font-medium uppercase tracking-[0.25em] text-white/30">
                    Premium Car Care
                </span>
            </motion.div>
        </section>
    );
}