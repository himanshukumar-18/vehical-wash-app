"use client";

import React from "react";
import { CarFront, X } from "lucide-react";
import { useBooking } from "@/context/BookingProvider";

const STEP_LABELS = [
  "Vehicle",
  "Service",
  "Date",
  "Address",
  "Review",
  "Payment",
];

export default function BookingHeader() {
  const { currentStep, closeBooking } = useBooking();

  const stepLabel = STEP_LABELS[currentStep] ?? "Complete";

  return (
    <div className="flex items-center justify-between border-b border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
      {/* Left: Icon + Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#19C7F3]/10 text-[#19C7F3] border border-[#19C7F3]/30">
          <CarFront size={20} />
        </div>
        <div>
          <h2 className="font-heading font-bold text-base sm:text-lg text-[#F5F7F8] tracking-tight">
            Book a Wash
          </h2>
          <p className="text-xs text-[#A7B0B7] mt-0.5">
            Step {Math.min(currentStep + 1, 6)} of 6 &mdash;{" "}
            <span className="text-[#19C7F3] font-semibold">{stepLabel}</span>
          </p>
        </div>
      </div>

      {/* Right: Close button */}
      <button
        onClick={closeBooking}
        type="button"
        aria-label="Close booking drawer"
        className="flex h-9 w-9 items-center justify-center border border-[#26313A] bg-[#080A0C] text-[#A7B0B7] transition hover:border-[#19C7F3]/50 hover:text-[#19C7F3]"
      >
        <X size={18} />
      </button>
    </div>
  );
}
