"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { ReactCompareSliderHandle } from "react-compare-slider";
import { motion } from "framer-motion";

import { useBooking } from "../../context/BookingProvider";

import { useSelector } from "react-redux";
import { selectPublicImages } from "../../lib/slices/imageSlice";

const FALLBACK_BEFORE = "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg";
const FALLBACK_AFTER = "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg";

const ReactCompareSlider = dynamic(
    () =>
        import("react-compare-slider").then((mod) => ({
            default: mod.ReactCompareSlider,
        })),
    {
        ssr: false,
    }
);

const steps = [
    {
        number: "01",
        title: "Choose your service",
        description:
            "Pick the wash, date and time that works best for you.",
    },
    {
        number: "02",
        title: "We come to you",
        description:
            "Our team arrives at your location and checks your vehicle before starting.",
    },
    {
        number: "03",
        title: "We clean & detail",
        description:
            "Professional washing, interior care and detailing with quality products.",
    },
    {
        number: "04",
        title: "Ready to drive",
        description:
            "We complete a final quality check and leave your car fresh and clean.",
    },
];

import { getDynamicImageSrc } from "../../lib/utils/imageUtils";

const Work = () => {
    const { openBooking } = useBooking();
    const publicImages = useSelector(selectPublicImages);
    const beforeImgSrc = getDynamicImageSrc(publicImages["gallery_work_before"]) || FALLBACK_BEFORE;
    const afterImgSrc = getDynamicImageSrc(publicImages["gallery_work_after"]) || FALLBACK_AFTER;

    return (
        <section
            id="how-it-works"
            className="
                relative
                overflow-hidden
                bg-[var(--color-page-bg)]
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
                    SECTION HEADER
                ===================================================== */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                        grid
                        gap-6
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
                            How It Works
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
                            Simple process.
                            <br />

                            <span className="text-[var(--color-primary)]">
                                Better finish.
                            </span>
                        </h2>

                        <p
                            className="
                                mt-6
                                max-w-[520px]
                                text-sm
                                leading-7
                                text-[var(--color-text)]
                                sm:text-base
                            "
                        >
                            From booking to final shine, we keep every step
                            simple, clear and professional.
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
                        gap-16
                        lg:mt-24
                        lg:grid-cols-[0.95fr_1.05fr]
                        lg:items-start
                        lg:gap-24
                    "
                >

                    {/* =================================================
                        LEFT — BEFORE / AFTER
                    ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -25,
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
                        className="
                            lg:sticky
                            lg:top-28
                        "
                    >
                        {/* Image */}

                        {beforeImgSrc && afterImgSrc && (
                            <div
                                className="
                                    relative
                                    overflow-hidden
                                    bg-[var(--color-section-bg)]
                                "
                            >
                                <ReactCompareSlider
                                    itemOne={
                                        <Image
                                            src={beforeImgSrc}
                                            alt="Car before professional wash"
                                            width={1000}
                                            height={750}
                                            className="
                                                h-[300px]
                                                w-full
                                                object-cover
                                                sm:h-[420px]
                                                lg:h-[520px]
                                            "
                                        />
                                    }
                                    itemTwo={
                                        <Image
                                            src={afterImgSrc}
                                            alt="Car after professional wash"
                                            width={1000}
                                            height={750}
                                            className="
                                                h-[300px]
                                                w-full
                                                object-cover
                                                sm:h-[420px]
                                                lg:h-[520px]
                                            "
                                        />
                                    }
                                handle={
                                    <ReactCompareSliderHandle
                                        buttonStyle={{
                                            backdropFilter: "blur(8px)",
                                            backgroundColor:
                                                "var(--color-primary)",
                                            border: "none",
                                            boxShadow:
                                                "0 8px 24px rgba(0,0,0,0.2)",
                                            color:
                                                "var(--color-black)",
                                        }}
                                        linesStyle={{
                                            background:
                                                "var(--color-primary)",
                                            boxShadow: "none",
                                        }}
                                    />
                                }
                                defaultPosition={50}
                                style={{
                                    width: "100%",
                                }}
                            />

                            {/* Labels */}

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-4
                                    top-4
                                    z-10
                                    bg-black/70
                                    px-3
                                    py-1.5
                                    text-[8px]
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    text-white
                                    backdrop-blur-sm
                                "
                            >
                                Before
                            </div>

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    right-4
                                    top-4
                                    z-10
                                    bg-[var(--color-primary)]
                                    px-3
                                    py-1.5
                                    text-[8px]
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    text-[var(--color-black)]
                                "
                            >
                                After
                            </div>
                        </div>
                        )}


                        {/* Compare information */}

                        <div
                            className="
                                mt-5
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="
                                        h-1.5
                                        w-1.5
                                        rounded-full
                                        bg-[var(--color-primary)]
                                    "
                                />

                                <span
                                    className="
                                        text-[9px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.18em]
                                        text-[var(--color-text)]
                                    "
                                >
                                    Drag to compare
                                </span>
                            </div>

                            <span
                                className="
                                    text-[9px]
                                    font-medium
                                    uppercase
                                    tracking-[0.15em]
                                    text-[var(--color-text-light)]
                                "
                            >
                                Before / After
                            </span>
                        </div>


                        {/* CTA */}

                        <button
                            type="button"
                            onClick={() => openBooking()}
                            className="
                                group
                                mt-8
                                flex
                                items-center
                                gap-3
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
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


                    {/* =================================================
                        RIGHT — PROCESS
                    ================================================= */}

                    <div className="relative">

                        {/* Vertical line */}

                        <div
                            className="
                                absolute
                                bottom-8
                                left-[19px]
                                top-8
                                hidden
                                w-px
                                bg-[var(--color-border)]
                                sm:block
                            "
                        />

                        <div className="space-y-10 sm:space-y-14">

                            {steps.map((step, index) => (
                                <motion.article
                                    key={step.number}
                                    initial={{
                                        opacity: 0,
                                        x: 20,
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
                                        duration: 0.55,
                                        delay: index * 0.08,
                                        ease: [
                                            0.22,
                                            1,
                                            0.36,
                                            1,
                                        ],
                                    }}
                                    className="
                                        group
                                        relative
                                        flex
                                        gap-6
                                        sm:gap-8
                                    "
                                >
                                    {/* Number */}

                                    <div
                                        className="
                                            relative
                                            z-10
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            bg-[var(--color-page-bg)]
                                        "
                                    >
                                        <span
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-[var(--color-border)]
                                                text-[9px]
                                                font-bold
                                                tracking-[0.08em]
                                                text-[var(--color-text)]
                                                transition-all
                                                duration-300
                                                group-hover:border-[var(--color-primary)]
                                                group-hover:bg-[var(--color-primary)]
                                                group-hover:text-[var(--color-black)]
                                            "
                                        >
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Content */}

                                    <div className="pt-1">
                                        <div
                                            className="
                                                mb-3
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >
                                            <Sparkles
                                                size={13}
                                                strokeWidth={1.8}
                                                className="
                                                    text-[var(--color-primary)]
                                                "
                                            />

                                            <span
                                                className="
                                                    text-[8px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-[0.18em]
                                                    text-[var(--color-text-light)]
                                                "
                                            >
                                                Step {index + 1}
                                            </span>
                                        </div>

                                        <h3
                                            className="
                                                font-heading
                                                text-[1.7rem]
                                                font-semibold
                                                leading-tight
                                                tracking-[-0.04em]
                                                text-[var(--color-heading)]
                                                transition-colors
                                                duration-300
                                                group-hover:text-[var(--color-primary)]
                                                sm:text-[2.1rem]
                                            "
                                        >
                                            {step.title}
                                        </h3>

                                        <p
                                            className="
                                                mt-3
                                                max-w-[500px]
                                                text-sm
                                                leading-7
                                                text-[var(--color-text)]
                                                sm:text-base
                                            "
                                        >
                                            {step.description}
                                        </p>

                                        <div
                                            className="
                                                mt-4
                                                flex
                                                items-center
                                                gap-2
                                                text-[8px]
                                                font-semibold
                                                uppercase
                                                tracking-[0.16em]
                                                text-[var(--color-text-light)]
                                            "
                                        >
                                            <Check
                                                size={13}
                                                className="
                                                    text-[var(--color-primary)]
                                                "
                                            />

                                            Quality checked
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Work;