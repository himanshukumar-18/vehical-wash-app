"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    ChevronDown,
    CircleHelp,
    PhoneCall,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSelector } from "react-redux";
import { selectPublicImages } from "../../lib/slices/imageSlice";
import { getDynamicImageSrc } from "../../lib/utils/imageUtils";

const FALLBACK_FAQ = "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg";

const faqs = [
    {
        question: "How long does a complete car wash take?",
        answer:
            "A standard wash usually takes 45 to 60 minutes. Full interior and exterior detailing may take 2 to 4 hours depending on your vehicle size and selected package.",
    },
    {
        question: "Do you use safe cleaning products?",
        answer:
            "Yes. We use professional-grade, vehicle-safe and eco-conscious cleaning products that are gentle on paint, glass, interiors and the environment.",
    },
    {
        question: "What payment methods do you accept?",
        answer:
            "We accept cash, UPI, debit cards, credit cards and secure online payments for a smooth booking experience.",
    },
    {
        question: "Do I need to book in advance?",
        answer:
            "Advance booking is recommended because it helps us reserve the right team and time slot for your vehicle. Walk-ins are welcome when slots are available.",
    },
    {
        question: "How often should I get my car professionally cleaned?",
        answer:
            "For regular maintenance, we recommend a professional wash every two to four weeks. Detailing can be done every three to six months.",
    },
];

const Fq = () => {
    const publicImages = useSelector(selectPublicImages);
    const dynamicFaqImg = getDynamicImageSrc(publicImages["faq_image"]) || FALLBACK_FAQ;

    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setActiveIndex((current) =>
            current === index ? null : index
        );
    };

    return (
        <section
            id="faq"
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
                    {/* Eyebrow */}

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
                            FAQ
                        </span>
                    </div>

                    {/* Heading */}

                    <div>
                        <h2
                            className="
                                max-w-[900px]
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
                            Questions?
                            <br />

                            <span className="text-[var(--color-primary)]">
                                We have answers.
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
                            Everything you need to know before booking
                            your next car wash.
                        </p>
                    </div>
                </motion.div>


                {/* =====================================================
                    MAIN CONTENT
                ===================================================== */}

                <div
                    className="
                        mt-14
                        grid
                        gap-12
                        lg:mt-20
                        lg:grid-cols-[0.85fr_1.15fr]
                        lg:items-start
                        lg:gap-20
                    "
                >

                    {/* =================================================
                        IMAGE / CONTACT
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
                            relative
                            w-full
                        "
                    >
                        {dynamicFaqImg && (
                            <div
                                className="
                                    relative
                                    h-[340px]
                                    overflow-hidden
                                    sm:h-[440px]
                                    lg:h-[570px]
                                "
                            >
                                <Image
                                    src={dynamicFaqImg}
                                    alt="Professional car wash service"
                                    fill
                                    sizes="
                                        (max-width: 1024px) 100vw,
                                        50vw
                                    "
                                    className="
                                        object-cover
                                        object-center
                                        transition-transform
                                        duration-700
                                        hover:scale-[1.02]
                                    "
                                />

                                <div
                                    className="
                                        absolute
                                        inset-0
                                        bg-gradient-to-t
                                        from-black/65
                                        via-black/5
                                        to-transparent
                                    "
                                />

                                {/* Image label */}

                                <div
                                    className="
                                        absolute
                                        left-5
                                        top-5
                                        flex
                                        items-center
                                        gap-2
                                        sm:left-7
                                        sm:top-7
                                    "
                                >
                                    <Sparkles
                                        size={14}
                                        className="
                                            text-[var(--color-primary)]
                                        "
                                    />

                                    <span
                                        className="
                                            text-[8px]
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


                        {/* =================================================
                            CONTACT BOX
                        ================================================= */}

                        <div
                            className="
                                relative
                                -mt-10
                                ml-4
                                mr-4
                                bg-[var(--color-black)]
                                p-5
                                sm:ml-8
                                sm:mr-8
                                sm:p-6
                                lg:absolute
                                lg:bottom-6
                                lg:left-6
                                lg:right-auto
                                lg:ml-0
                                lg:mr-0
                                lg:w-[290px]
                            "
                        >
                            <p
                                className="
                                    text-[8px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.2em]
                                    text-white/50
                                "
                            >
                                Still have questions?
                            </p>

                            <h3
                                className="
                                    mt-2
                                    max-w-[250px]
                                    font-heading
                                    text-xl
                                    font-semibold
                                    leading-tight
                                    tracking-[-0.035em]
                                    text-white
                                    sm:text-2xl
                                "
                            >
                                Talk to our team.
                            </h3>

                            <div
                                className="
                                    my-5
                                    h-px
                                    bg-white/10
                                "
                            />

                            <a
                                href="tel:+919876543210"
                                className="
                                    group
                                    flex
                                    items-center
                                    gap-3
                                "
                            >
                                <span
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        bg-[var(--color-primary)]
                                        text-[var(--color-black)]
                                    "
                                >
                                    <PhoneCall size={17} />
                                </span>

                                <span>
                                    <span
                                        className="
                                            block
                                            text-[8px]
                                            font-medium
                                            uppercase
                                            tracking-[0.15em]
                                            text-white/45
                                        "
                                    >
                                        Call anytime
                                    </span>

                                    <span
                                        className="
                                            mt-1
                                            block
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition-colors
                                            duration-300
                                            group-hover:text-[var(--color-primary)]
                                        "
                                    >
                                        +91 98765 43210
                                    </span>
                                </span>
                            </a>
                        </div>
                    </motion.div>


                    {/* =================================================
                        FAQ ACCORDION
                    ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 25,
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
                        className="w-full"
                    >
                        <div>
                            {faqs.map((faq, index) => {
                                const isOpen =
                                    activeIndex === index;

                                return (
                                    <div
                                        key={faq.question}
                                        className="
                                            border-t
                                            border-[var(--color-border)]
                                            last:border-b
                                        "
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleFaq(index)
                                            }
                                            aria-expanded={isOpen}
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-4
                                                py-6
                                                text-left
                                                sm:py-7
                                            "
                                        >
                                            {/* Number */}

                                            <span
                                                className={`
                                                    hidden
                                                    w-8
                                                    shrink-0
                                                    text-[9px]
                                                    font-bold
                                                    tracking-[0.1em]
                                                    transition-colors
                                                    duration-300
                                                    sm:block
                                                    ${isOpen
                                                        ? "text-[var(--color-primary)]"
                                                        : "text-[var(--color-text-light)]"
                                                    }
                                                `}
                                            >
                                                0{index + 1}
                                            </span>

                                            {/* Icon */}

                                            <CircleHelp
                                                size={18}
                                                strokeWidth={1.7}
                                                className={`
                                                    shrink-0
                                                    transition-colors
                                                    duration-300
                                                    ${isOpen
                                                        ? "text-[var(--color-primary)]"
                                                        : "text-[var(--color-text-light)]"
                                                    }
                                                `}
                                            />

                                            {/* Question */}

                                            <span
                                                className={`
                                                    flex-1
                                                    font-heading
                                                    text-base
                                                    font-semibold
                                                    leading-6
                                                    tracking-[-0.02em]
                                                    transition-colors
                                                    duration-300
                                                    sm:text-lg
                                                    ${isOpen
                                                        ? "text-[var(--color-heading)]"
                                                        : "text-[var(--color-text)]"
                                                    }
                                                `}
                                            >
                                                {faq.question}
                                            </span>

                                            {/* Arrow */}

                                            <span
                                                className={`
                                                    flex
                                                    h-8
                                                    w-8
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    transition-all
                                                    duration-300
                                                    ${isOpen
                                                        ? "bg-[var(--color-primary)] text-[var(--color-black)]"
                                                        : "bg-[var(--color-card-bg)] text-[var(--color-text)]"
                                                    }
                                                `}
                                            >
                                                <ChevronDown
                                                    size={16}
                                                    strokeWidth={2}
                                                    className={`
                                                        transition-transform
                                                        duration-300
                                                        ${isOpen
                                                            ? "rotate-180"
                                                            : ""
                                                        }
                                                    `}
                                                />
                                            </span>
                                        </button>


                                        {/* Answer */}

                                        <AnimatePresence
                                            initial={false}
                                        >
                                            {isOpen && (
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
                                                        ease: "easeInOut",
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <p
                                                        className="
                                                            max-w-[650px]
                                                            pb-6
                                                            pl-0
                                                            text-sm
                                                            leading-7
                                                            text-[var(--color-text)]
                                                            sm:pb-7
                                                            sm:pl-[4.75rem]
                                                            sm:text-base
                                                        "
                                                    >
                                                        {faq.answer}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>


                        {/* Bottom helper */}

                        <div
                            className="
                                mt-8
                                flex
                                items-center
                                gap-3
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.16em]
                                text-[var(--color-text-light)]
                            "
                        >
                            <span
                                className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-[var(--color-primary)]
                                "
                            />

                            Can't find what you're looking for?
                            Give us a call.
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Fq;