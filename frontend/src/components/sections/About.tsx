"use client";

import React from "react";
import Image from "next/image";
import {
    ArrowUpRight,
    BadgeCheck,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectPublicImages } from "../../lib/slices/imageSlice";

const FALLBACK_ABOUT = "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg";

const highlights = [
    {
        icon: ShieldCheck,
        title: "Our Mission",
        description:
            "Deliver reliable car care with professional quality, every time.",
    },
    {
        icon: BadgeCheck,
        title: "Our Vision",
        description:
            "Make premium car care simple and trusted for every driver.",
    },
    {
        icon: Sparkles,
        title: "Our Promise",
        description:
            "Quality products, honest service and a finish you can see.",
    },
];

import { getDynamicImageSrc } from "../../lib/utils/imageUtils";

const About = () => {
    const publicImages = useSelector(selectPublicImages);
    const mainImgSrc = getDynamicImageSrc(publicImages["about_main"]) || FALLBACK_ABOUT;

    return (
        <section
            id="about"
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
                    MAIN GRID
                ===================================================== */}

                <div
                    className="
                        grid
                        gap-16
                        lg:grid-cols-[0.95fr_1.05fr]
                        lg:items-center
                        lg:gap-20
                        xl:gap-28
                    "
                >

                    {/* =================================================
                        IMAGE AREA
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
                        className="
                            relative
                            mx-auto
                            w-full
                            max-w-[620px]
                            pb-14
                            sm:pb-16
                            lg:mx-0
                        "
                    >
                        {/* Small accent line */}

                        <span
                            className="
                                absolute
                                -left-1
                                top-10
                                hidden
                                h-24
                                w-[2px]
                                bg-[var(--color-primary)]
                                sm:block
                                lg:-left-5
                            "
                        />

                        {/* Main image */}

                        {mainImgSrc && (
                            <div
                                className="
                                    relative
                                    h-[400px]
                                    w-full
                                    overflow-hidden
                                    sm:h-[500px]
                                    lg:h-[570px]
                                "
                            >
                                <Image
                                    src={mainImgSrc}
                                    alt="Professional doorstep car wash service and mobile detailing team in Hazaribagh"
                                    fill
                                    priority
                                    sizes="
                                        (max-width: 640px) 100vw,
                                        (max-width: 1024px) 75vw,
                                        50vw
                                    "
                                    className="
                                        object-cover
                                        transition-transform
                                        duration-700
                                        hover:scale-[1.02]
                                    "
                                />
                            </div>
                        )}
                    </motion.div>


                    {/* =================================================
                        CONTENT
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
                        className="max-w-[680px]"
                    >

                        {/* Label */}

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
                                About Us
                            </span>
                        </div>


                        {/* Heading */}

                        <h2
                            className="
                                mt-6
                                font-heading
                                text-[2.8rem]
                                font-semibold
                                uppercase
                                leading-[0.92]
                                tracking-[-0.06em]
                                text-[var(--color-heading)]
                                sm:text-[4rem]
                                md:text-[4.5rem]
                                lg:text-[5rem]
                            "
                        >
                            More than
                            <br />

                            <span className="text-[var(--color-primary)]">
                                a car wash.
                            </span>
                        </h2>


                        {/* Description */}

                        <p
                            className="
                                mt-7
                                max-w-[580px]
                                text-sm
                                leading-7
                                text-[var(--color-text)]
                                sm:text-base
                                sm:leading-8
                            "
                        >
                            We bring professional car care closer to you.
                            From a quick exterior wash to complete detailing,
                            every service is built around quality, care and
                            a finish that makes your car feel new again.
                        </p>


                        {/* =================================================
                            HIGHLIGHTS
                        ================================================= */}

                        <div className="mt-10">
                            {highlights.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <motion.div
                                        key={item.title}
                                        initial={{
                                            opacity: 0,
                                            y: 15,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.08,
                                        }}
                                        className="
                                            group
                                            flex
                                            gap-5
                                            py-5
                                        "
                                    >
                                        {/* Icon */}

                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                text-[var(--color-primary)]
                                            "
                                        >
                                            <Icon
                                                size={22}
                                                strokeWidth={1.6}
                                            />
                                        </div>

                                        {/* Content */}

                                        <div>
                                            <h3
                                                className="
                                                    font-heading
                                                    text-base
                                                    font-semibold
                                                    tracking-[-0.02em]
                                                    text-[var(--color-heading)]
                                                    transition-colors
                                                    duration-300
                                                    group-hover:text-[var(--color-primary)]
                                                "
                                            >
                                                {item.title}
                                            </h3>

                                            <p
                                                className="
                                                    mt-1
                                                    max-w-[500px]
                                                    text-sm
                                                    leading-6
                                                    text-[var(--color-text)]
                                                "
                                            >
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>


                        {/* =================================================
                            CTA
                        ================================================= */}

                        <div className="mt-8">
                            <a
                                href="#services"
                                className="
                                    group
                                    inline-flex
                                    items-center
                                    gap-3
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-[var(--color-heading)]
                                    transition-colors
                                    duration-300
                                    hover:text-[var(--color-primary)]
                                "
                            >
                                Explore our services

                                <span
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        bg-[var(--color-primary)]
                                        text-[var(--color-black)]
                                        transition-all
                                        duration-300
                                        group-hover:translate-x-1
                                    "
                                >
                                    <ArrowUpRight size={16} />
                                </span>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;