"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { useBooking } from "../../context/BookingProvider";
import { AppDispatch } from "../../lib/store";
import {
  fetchServices,
  selectServices,
  selectServicesLoading,
  selectServiceError,
} from "../../lib/slices/serviceSlice";
import { Service as BackendService } from "../../lib/api/serviceApi";

const DEFAULT_IMAGES = [
  "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg",
  "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg",
  "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg",
];

export default function Pricing() {
  const dispatch = useDispatch<AppDispatch>();
  const { openBooking } = useBooking();

  const services = useSelector(selectServices);
  const loading = useSelector(selectServicesLoading);
  const error = useSelector(selectServiceError);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const activeServices = services.filter((s) => s.is_active);

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[var(--color-page-bg)] px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-7 lg:grid-cols-[0.65fr_1.35fr] lg:items-end"
        >
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-[var(--color-primary)] sm:w-12" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--color-primary)] sm:text-[10px]">
              Pricing
            </span>
          </div>

          <div>
            <h2 className="max-w-[900px] font-heading text-[2.8rem] font-semibold uppercase leading-[0.9] tracking-[-0.06em] text-[var(--color-heading)] sm:text-[4rem] md:text-[5rem] lg:text-[6rem]">
              Simple plans.
              <br />
              <span className="text-[var(--color-primary)]">Clear pricing.</span>
            </h2>

            <p className="mt-6 max-w-[560px] text-sm leading-7 text-[var(--color-text)] sm:text-base">
              Choose the level of care your car needs. Transparent prices powered by our doorstep washing van.
            </p>
          </div>
        </motion.div>

        {/* PRICING CARDS */}
        {loading ? (
          <PricingSkeletons />
        ) : error ? (
          <div className="mt-14 flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-red-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => dispatch(fetchServices())}
              className="inline-flex items-center gap-2 border border-[var(--color-primary)] px-4 py-2 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-black"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : activeServices.length === 0 ? (
          <div className="mt-14 py-16 text-center text-sm text-[var(--color-text-light)]">
            No pricing plans available right now.
          </div>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-6">
            {activeServices.map((service, index) => (
              <PricingCard
                key={service.id || service.slug}
                service={service}
                index={index}
                onSelect={() => openBooking({ service })}
              />
            ))}
          </div>
        )}

        {/* FOOTNOTE */}
        <div className="mt-8 flex flex-col gap-2 text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--color-text-light)] sm:flex-row sm:items-center sm:justify-between">
          <span>Professional equipment & premium products included in every wash</span>
          <span>Transparent pricing · Doorstep mobile service</span>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  service,
  index,
  onSelect,
}: {
  service: BackendService;
  index: number;
  onSelect: () => void;
}) {
  const imageSrc = service.image_url || service.image || DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
  const priceDisplay = typeof service.price === "number" ? String(service.price) : String(service.price).replace(/[^0-9.]/g, "");
  const isPopular = Boolean(service.is_featured);

  // Extract inclusion features or fallbacks
  const featuresList = service.description
    ? service.description.split("\n").map((line) => line.trim()).filter(Boolean)
    : [
        "Doorstep mobile wash service",
        "Tyre & wheel cleaning",
        "Interior vacuuming",
        "Dashboard wiping",
        "Water & foam wash",
      ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex min-h-full flex-col overflow-hidden bg-[var(--color-card-bg)] border border-[var(--color-border)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[0_18px_45px_rgba(17,17,17,0.10)]"
    >
      {/* IMAGE */}
      <div className="relative h-[215px] overflow-hidden sm:h-[240px] lg:h-[260px]">
        <Image
          src={imageSrc}
          alt={service.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-5 left-5 z-10 sm:bottom-6 sm:left-6">
          <span className="block text-[8px] font-semibold uppercase tracking-[0.22em] text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
            {service.duration_minutes ? `${service.duration_minutes} Mins Duration` : "Car Care Package"}
          </span>
          <h3 className="mt-1 font-heading text-3xl font-semibold leading-none tracking-[-0.045em] text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)] sm:text-4xl">
            {service.name}
          </h3>
        </div>

        {isPopular && (
          <div className="absolute right-4 top-4 z-10 bg-[var(--color-primary)] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--color-black)]">
            Most Popular
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-6 sm:p-7 lg:p-8">
        <p className="text-sm leading-6 text-[var(--color-text)]">
          {service.short_description || service.description || "Professional doorstep car care service."}
        </p>

        {/* PRICE */}
        <div className="mt-7 flex items-end">
          <span className="mb-1 mr-1 text-lg font-semibold text-[var(--color-heading)]">₹</span>
          <span className="font-heading text-[3.8rem] font-semibold leading-none tracking-[-0.07em] text-[var(--color-heading)] sm:text-[4.3rem]">
            {priceDisplay}
          </span>
          <span className="mb-2 ml-2 text-xs font-medium text-[var(--color-text-light)]">/ wash</span>
        </div>

        {/* FEATURES */}
        <div className="mt-8 flex-1">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-light)]">
            What's included
          </span>

          <ul className="mt-5 space-y-4">
            {featuresList.slice(0, 5).map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-6 text-[var(--color-text)]">
                <Check size={15} strokeWidth={2.2} className="mt-1 shrink-0 text-[var(--color-primary)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onSelect}
          className={`group/button mt-9 flex w-full items-center justify-between px-5 py-4 text-[10px] font-bold uppercase tracking-[0.13em] transition-all duration-300 ${
            isPopular
              ? "bg-[var(--color-primary)] text-[var(--color-black)] hover:bg-[var(--color-primary-hover)]"
              : "bg-[var(--color-black)] text-white hover:bg-[var(--color-primary)] hover:text-[var(--color-black)]"
          }`}
        >
          <span>Select Service</span>
          <ArrowUpRight
            size={17}
            strokeWidth={1.8}
            className="transition-transform duration-300 group-hover/button:translate-x-1 group-hover/button:-translate-y-1"
          />
        </button>
      </div>
    </motion.article>
  );
}

function PricingSkeletons() {
  return (
    <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 animate-pulse space-y-4">
          <div className="h-48 w-full bg-[var(--color-section-bg)] rounded" />
          <div className="h-6 w-3/4 bg-[var(--color-section-bg)] rounded" />
          <div className="h-12 w-1/2 bg-[var(--color-section-bg)] rounded" />
          <div className="h-24 w-full bg-[var(--color-section-bg)] rounded" />
        </div>
      ))}
    </div>
  );
}