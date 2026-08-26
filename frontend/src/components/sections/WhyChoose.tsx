"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    ArrowUpRight,
    ChevronDown,
    Leaf,
    ShieldCheck,
    Sparkles,
    Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useBooking } from "../../context/BookingProvider";
import { useSelector } from "react-redux";
import { selectPublicImages } from "../../lib/slices/imageSlice";
import { getDynamicImageSrc } from "../../lib/utils/imageUtils";

const FALLBACK_WHY_CHOOSE = "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg";

const reasons = [
    {
        title: "Quality Products",
        description:
            "We use safe, high-quality products and professional techniques for a clean, polished finish.",
        icon: Leaf,
    },
    {
        title: "Fast & Reliable",
        description:
            "Our trained team works efficiently while giving every part of your vehicle the attention it deserves.",
        icon: Zap,
    },
    {
        title: "Trusted Service",
        description:
            "Clear pricing, dependable service and consistent results make us a trusted choice for car care.",
        icon: ShieldCheck,
    },
];

const WhyChoose = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { openBooking } = useBooking();
    const publicImages = useSelector(selectPublicImages);
    const dynamicWhyChooseImg = getDynamicImageSrc(publicImages["why_choose_image"]) || FALLBACK_WHY_CHOOSE;

    return (
        <section
            id="why-choose-us"
            className="
                relative
                overflow-hidden
                bg-[var(--color-section-bg)]
                px-5
                py-24
                sm:px-8
                sm:py-28
                lg:px-12
                lg:py-36
            "
        >
            <div className="mx-auto max-w-[1400px]">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="
                        grid
                        gap-7
                        lg:grid-cols-[0.7fr_1.3fr]
                        lg:items-end
                    "
                >
                    <div className="flex items-center gap-3">
                        <span
                            className="
                                h-[2px]
                                w-8
                                bg-[var(--color-primary)]
                                sm:w-12
                            "
                        />

                        <span
                            className="
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-[0.25em]
                                text-[var(--color-primary)]
                                sm:text-[10px]
                            "
                        >
                            Why Choose Us
                        </span>
                    </div>

                    <div>
                        <h2
                            className="
                                max-w-[850px]
                                font-heading
                                text-[2.8rem]
                                font-semibold
                                uppercase
                                leading-[0.9]
                                tracking-[-0.06em]
                                text-[var(--color-heading)]
                                sm:text-[4rem]
                                md:text-[5rem]
                                lg:text-[6rem]
                            "
                        >
                            Care that shows.
                            <br />

                            <span className="text-[var(--color-primary)]">
                                Quality you feel.
                            </span>
                        </h2>

                        <p
                            className="
                                mt-6
                                max-w-[560px]
                                text-sm
                                leading-7
                                text-[var(--color-text)]
                                sm:text-base
                            "
                        >
                            Professional car care built around quality,
                            reliability and attention to detail.
                        </p>
                    </div>
                </motion.div>


                {/* =====================================================
                    MAIN CONTENT
                ===================================================== */}

                <div
                    className="
                        mt-16
                        grid
                        gap-14
                        lg:mt-24
                        lg:grid-cols-[1.05fr_0.95fr]
                        lg:items-center
                        lg:gap-24
                    "
                >

                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -30,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative"
                    >
                        {dynamicWhyChooseImg && (
                            <div
                                className="
                                    relative
                                    h-[420px]
                                    overflow-hidden
                                    sm:h-[520px]
                                    lg:h-[620px]
                                "
                            >
                                <Image
                                    src={dynamicWhyChooseImg}
                                    alt="Professional car wash specialist"
                                    fill
                                    sizes="
                                        (max-width: 1024px) 100vw,
                                        55vw
                                    "
                                    className="
                                        object-cover
                                        object-center
                                        transition-transform
                                        duration-700
                                        hover:scale-[1.02]
                                    "
                                />

                                {/* Image label */}

                                <div
                                    className="
                                        absolute
                                        bottom-5
                                        left-5
                                        flex
                                        items-center
                                        gap-3
                                        sm:bottom-7
                                        sm:left-7
                                    "
                                >
                                    <span
                                        className="
                                            h-2
                                            w-2
                                            rounded-full
                                            bg-[var(--color-primary)]
                                            shadow-[0_0_12px_rgba(25,199,243,0.6)]
                                        "
                                    />

                                    <span
                                        className="
                                            text-[9px]
                                            font-semibold
                                            uppercase
                                            tracking-[0.2em]
                                            text-white
                                        "
                                    >
                                        Professional Car Care
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>


                    {/* =================================================
                        REASONS
                    ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 30,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative"
                    >
                        <div className="mb-10">
                            <p
                                className="
                                    max-w-[500px]
                                    text-sm
                                    leading-7
                                    text-[var(--color-text)]
                                    sm:text-base
                                "
                            >
                                Every vehicle deserves more than a basic
                                wash. We focus on the details that make the
                                difference.
                            </p>
                        </div>


                        {/* Reason list */}

                        <div>
                            {reasons.map((reason, index) => {
                                const Icon = reason.icon;
                                const isActive = activeIndex === index;

                                return (
                                    <div
                                        key={reason.title}
                                        className="
                                            relative
                                            border-b
                                            border-[var(--color-border)]
                                        "
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveIndex(
                                                    isActive ? -1 : index
                                                )
                                            }
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-5
                                                py-6
                                                text-left
                                                sm:py-7
                                            "
                                        >
                                            {/* Number */}

                                            <span
                                                className={`
                                                    text-[10px]
                                                    font-bold
                                                    tracking-[0.12em]
                                                    transition-colors
                                                    duration-300
                                                    ${isActive
                                                        ? "text-[var(--color-primary)]"
                                                        : "text-[var(--color-text-light)]"
                                                    }
                                                `}
                                            >
                                                0{index + 1}
                                            </span>

                                            {/* Icon */}

                                            <span
                                                className={`
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    transition-colors
                                                    duration-300
                                                    ${isActive
                                                        ? "text-[var(--color-primary)]"
                                                        : "text-[var(--color-text)]"
                                                    }
                                                `}
                                            >
                                                <Icon
                                                    size={20}
                                                    strokeWidth={1.6}
                                                />
                                            </span>

                                            {/* Title */}

                                            <span
                                                className={`
                                                    flex-1
                                                    font-heading
                                                    text-lg
                                                    font-semibold
                                                    tracking-[-0.025em]
                                                    transition-colors
                                                    duration-300
                                                    sm:text-xl
                                                    ${isActive
                                                        ? "text-[var(--color-heading)]"
                                                        : "text-[var(--color-text)]"
                                                    }
                                                `}
                                            >
                                                {reason.title}
                                            </span>

                                            {/* Arrow */}

                                            <span
                                                className={`
                                                    transition-all
                                                    duration-300
                                                    ${isActive
                                                        ? "rotate-180 text-[var(--color-primary)]"
                                                        : "text-[var(--color-text-light)]"
                                                    }
                                                `}
                                            >
                                                <ChevronDown size={18} />
                                            </span>
                                        </button>


                                        {/* Description */}

                                        <AnimatePresence initial={false}>
                                            {isActive && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <p
                                                        className="
                                                            max-w-[500px]
                                                            pb-6
                                                            pl-[5.25rem]
                                                            text-sm
                                                            leading-7
                                                            text-[var(--color-text)]
                                                            sm:pb-7
                                                        "
                                                    >
                                                        {reason.description}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>


                        {/* =================================================
                            CTA
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() => openBooking()}
                            className="
                                group
                                mt-9
                                inline-flex
                                items-center
                                gap-3
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.13em]
                                text-[var(--color-heading)]
                                transition-colors
                                duration-300
                                hover:text-[var(--color-primary)]
                            "
                        >
                            Book your wash

                            <span
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    bg-[var(--color-primary)]
                                    text-[var(--color-black)]
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-1
                                "
                            >
                                <ArrowUpRight size={16} />
                            </span>
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default WhyChoose;