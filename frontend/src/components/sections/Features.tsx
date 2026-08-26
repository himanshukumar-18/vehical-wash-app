"use client";

import React from "react";
import {
  ArrowUpRight,
  CarFront,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { useBooking } from "../../context/BookingProvider";

const features = [
  {
    number: "01",
    title: "Professional Cleaning",
    description:
      "Modern equipment and proven cleaning methods deliver a deep, spotless finish without compromising your vehicle.",
    icon: CarFront,
  },
  {
    number: "02",
    title: "Expert Detailing",
    description:
      "Our trained team works carefully across every surface, from exterior paint to interior details.",
    icon: Wrench,
  },
  {
    number: "03",
    title: "Complete Protection",
    description:
      "Quality products and careful finishing help keep your vehicle cleaner, fresher and looking its best.",
    icon: ShieldCheck,
  },
];

const Features = () => {
  const { openBooking } = useBooking();

  return (
    <section
      id="features"
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
                    HEADER
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
              Our Difference
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
              More than a wash.
              <br />

              <span className="text-[var(--color-primary)]">
                Better car care.
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
              Professional care focused on the details that
              make your vehicle look and feel its best.
            </p>
          </div>
        </motion.div>


        {/* =====================================================
                    FEATURE LIST
                ===================================================== */}

        <div
          className="
                        mt-16
                        lg:mt-24
                    "
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.number}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                                    group
                                    relative
                                    grid
                                    gap-6
                                    border-t
                                    border-[var(--color-border)]
                                    py-8
                                    sm:py-10
                                    lg:grid-cols-[100px_0.9fr_1.1fr_80px]
                                    lg:items-center
                                    lg:gap-10
                                    lg:py-12
                                "
              >
                {/* Number */}

                <span
                  className="
                                        font-heading
                                        text-sm
                                        font-semibold
                                        tracking-[0.08em]
                                        text-[var(--color-text-light)]
                                        transition-colors
                                        duration-300
                                        group-hover:text-[var(--color-primary)]
                                    "
                >
                  {feature.number}
                </span>


                {/* Title */}

                <div>
                  <div
                    className="
                                            mb-4
                                            flex
                                            items-center
                                            gap-3
                                        "
                  >
                    <span
                      className="
                                                flex
                                                h-9
                                                w-9
                                                items-center
                                                justify-center
                                                bg-[var(--color-primary-light)]
                                                text-[var(--color-primary)]
                                                transition-all
                                                duration-300
                                                group-hover:bg-[var(--color-primary)]
                                                group-hover:text-[var(--color-black)]
                                            "
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.7}
                      />
                    </span>

                    <span
                      className="
                                                text-[8px]
                                                font-semibold
                                                uppercase
                                                tracking-[0.2em]
                                                text-[var(--color-text-light)]
                                            "
                    >
                      Premium Care
                    </span>
                  </div>

                  <h3
                    className="
                                            font-heading
                                            text-[1.8rem]
                                            font-semibold
                                            leading-tight
                                            tracking-[-0.045em]
                                            text-[var(--color-heading)]
                                            transition-colors
                                            duration-300
                                            group-hover:text-[var(--color-primary)]
                                            sm:text-[2.2rem]
                                            lg:text-[2.5rem]
                                        "
                  >
                    {feature.title}
                  </h3>
                </div>


                {/* Description */}

                <p
                  className="
                                        max-w-[500px]
                                        text-sm
                                        leading-7
                                        text-[var(--color-text)]
                                        sm:text-base
                                    "
                >
                  {feature.description}
                </p>


                {/* Arrow */}

                <div
                  className="
                                        hidden
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        border
                                        border-[var(--color-border)]
                                        text-[var(--color-heading)]
                                        transition-all
                                        duration-300
                                        group-hover:border-[var(--color-primary)]
                                        group-hover:bg-[var(--color-primary)]
                                        group-hover:text-[var(--color-black)]
                                        lg:flex
                                    "
                >
                  <ArrowUpRight
                    size={18}
                    className="
                                            transition-transform
                                            duration-300
                                            group-hover:translate-x-1
                                            group-hover:-translate-y-1
                                        "
                  />
                </div>
              </motion.article>
            );
          })}

          {/* Bottom line */}

          <div
            className="
                            border-t
                            border-[var(--color-border)]
                        "
          />
        </div>


        {/* =====================================================
                    MOBILE / GENERAL CTA
                ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="
                        mt-10
                        flex
                        flex-col
                        gap-5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
        >
          <div
            className="
                            flex
                            items-center
                            gap-3
                        "
          >
            <Sparkles
              size={15}
              className="text-[var(--color-primary)]"
            />

            <span
              className="
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-[var(--color-text-light)]
                            "
            >
              Designed for every vehicle
            </span>
          </div>

          <button
            type="button"
            onClick={() => openBooking()}
            className="
                            group
                            flex
                            w-fit
                            items-center
                            gap-3
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
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
    </section>
  );
};

export default Features;