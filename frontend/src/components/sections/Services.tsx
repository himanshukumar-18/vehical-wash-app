"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, CarFront, Droplets, RefreshCw, Sparkles, Wrench } from "lucide-react";
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
  "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg",
];
const DEFAULT_ICONS = [Droplets, Wrench, Sparkles, CarFront];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 25 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const fadeUpOnce = {
  initial: { opacity: 0, y: 15 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function Services() {
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
      id="services"
      className="relative overflow-hidden bg-[var(--color-section-bg)] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* HEADER */}
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--color-primary)] sm:w-12" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--color-primary)] sm:text-[10px]">
              What We Do
            </span>
          </div>

          <div>
            <h2 className="mt-5 max-w-[750px] font-heading font-semibold uppercase leading-[0.95] tracking-[-0.055em] text-[var(--color-heading)] text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] lg:mt-0 lg:text-[5rem]">
              Car care.
              <br />
              <span className="text-[var(--color-primary)]">Done right.</span>
            </h2>

            <p className="mt-5 max-w-[540px] text-sm leading-6 text-[var(--color-text)] sm:text-base sm:leading-7">
              Professional car cleaning at your doorstep. Simple service, careful work and a finish you can see.
            </p>
          </div>
        </div>

        {/* SERVICE LIST CONTAINER */}
        <div className="mt-14 border-t border-[var(--color-border)] sm:mt-20">
          {loading ? (
            <ServiceSkeletons />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
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
            <div className="py-20 text-center">
              <p className="text-base font-semibold text-[var(--color-heading)]">No services available right now.</p>
              <p className="mt-1 text-xs text-[var(--color-text-light)]">Please check back later.</p>
            </div>
          ) : (
            activeServices.map((service, index) => (
              <ServiceRow
                key={service.id || service.slug}
                service={service}
                index={index}
                onBook={() => openBooking()}
              />
            ))
          )}
        </div>

        {/* BOTTOM CTA */}
        <motion.div
          {...fadeUpOnce}
          className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs font-medium text-[var(--color-text-light)]">
              Not sure what your car needs?
            </p>
            <p className="mt-1 font-heading text-sm font-semibold text-[var(--color-heading)]">
              Let our team help you choose.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openBooking()}
            className="group inline-flex h-11 w-fit items-center gap-3 border border-[var(--color-primary)] bg-transparent px-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-primary)] transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-[var(--color-black)] active:scale-[0.98]"
          >
            Book a Wash
            <ArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function ServiceRow({
  service,
  index,
  onBook,
}: {
  service: BackendService;
  index: number;
  onBook: () => void;
}) {
  const Icon = DEFAULT_ICONS[index % DEFAULT_ICONS.length];
  const imageSrc = service.image_url || service.image || DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
  const formattedNumber = String(index + 1).padStart(2, "0");
  const priceDisplay = typeof service.price === "number" ? `₹${service.price}` : service.price.startsWith("₹") ? service.price : `₹${service.price}`;

  return (
    <motion.article
      {...fadeUp(index * 0.06)}
      className="group border-b border-[var(--color-border)] cursor-pointer"
      onClick={onBook}
    >
      <div className="grid gap-6 py-7 sm:py-9 lg:grid-cols-[80px_1fr_1fr_60px] lg:items-center lg:gap-8">
        <span className="hidden font-heading text-xs font-medium tracking-[0.15em] text-[var(--color-primary)] lg:block">
          {formattedNumber}
        </span>

        <div className="flex items-start gap-4">
          <span className="pt-1 font-heading text-[10px] font-medium tracking-[0.12em] text-[var(--color-primary)] lg:hidden">
            {formattedNumber}
          </span>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Icon size={15} strokeWidth={1.7} className="text-[var(--color-primary)]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-light)]">
                {service.duration_minutes ? `${service.duration_minutes} Mins` : "Wash Package"}
              </span>
            </div>
            <h3 className="font-heading font-semibold tracking-[-0.04em] text-[var(--color-heading)] transition-colors duration-300 group-hover:text-[var(--color-primary)] text-[1.7rem] sm:text-2xl lg:text-[2rem]">
              {service.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center lg:justify-between">
          <p className="max-w-[380px] text-xs leading-6 text-[var(--color-text)] sm:text-sm">
            {service.short_description || service.description}
          </p>

          <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end">
            <span className="text-lg font-bold text-[var(--color-primary)]">{priceDisplay}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-primary)] sm:hidden inline-flex items-center gap-1">
              Book <ArrowUpRight size={12} />
            </span>
          </div>

          <div className="relative hidden h-[90px] w-[145px] shrink-0 overflow-hidden border border-[var(--color-border)] lg:block">
            <Image
              src={imageSrc}
              alt={service.name}
              fill
              sizes="145px"
              className="object-cover grayscale-[15%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-black/10 transition group-hover:bg-transparent" />
          </div>
        </div>

        <div className="hidden lg:flex lg:justify-end">
          <span className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-text)] transition-all duration-300 group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-black)]">
            <ArrowUpRight
              size={17}
              strokeWidth={1.8}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function ServiceSkeletons() {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-8 animate-pulse grid grid-cols-1 gap-4 lg:grid-cols-[80px_1fr_1fr_60px]">
          <div className="h-4 w-6 bg-[#26313A]/40 rounded hidden lg:block" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-[#26313A]/40 rounded" />
            <div className="h-8 w-48 bg-[#26313A]/60 rounded" />
          </div>
          <div className="h-16 w-full bg-[#26313A]/30 rounded" />
          <div className="h-10 w-10 bg-[#26313A]/40 rounded justify-self-end hidden lg:block" />
        </div>
      ))}
    </div>
  );
}