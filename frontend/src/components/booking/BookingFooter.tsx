"use client";

import React from "react";
import { ChevronLeft, ArrowRight, CreditCard, CheckCircle2 } from "lucide-react";
import { useBooking } from "@/context/BookingProvider";

interface BookingFooterProps {
  onNext: () => void;
  onPrev: () => void;
  nextLoading?: boolean;
  nextDisabled?: boolean;
}

const TOTAL_STEPS = 6;

export default function BookingFooter({
  onNext,
  onPrev,
  nextLoading = false,
  nextDisabled = false,
}: BookingFooterProps) {
  const { currentStep } = useBooking();

  const isFirstStep = currentStep === 0;
  const isReviewStep = currentStep === TOTAL_STEPS - 2;
  const isPaymentStep = currentStep === TOTAL_STEPS - 1;

  const getNextLabel = () => {
    if (isPaymentStep) return "Confirm Booking";
    if (isReviewStep) return "Continue to Payment";
    return "Continue";
  };

  const getNextIcon = () => {
    if (isPaymentStep) return <CheckCircle2 size={16} />;
    if (isReviewStep) return <CreditCard size={16} />;
    return <ArrowRight size={16} />;
  };

  return (
    <div className="flex items-center gap-3 border-t border-[#26313A] bg-[#0D1115] p-4 sm:p-5 shrink-0">
      {/* Previous Button */}
      {!isFirstStep && (
        <button
          type="button"
          onClick={onPrev}
          disabled={nextLoading}
          aria-label="Go to previous step"
          className="flex h-11 items-center justify-center gap-1.5 border border-[#26313A] bg-[#080A0C] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[#F5F7F8] transition hover:border-[#19C7F3]/50 hover:text-[#19C7F3] disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
      )}

      {/* Next / Action Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || nextLoading}
        aria-label={getNextLabel()}
        className="flex h-11 flex-1 items-center justify-center gap-2 bg-[#19C7F3] px-6 text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:bg-[#0FA9D1] disabled:opacity-50 disabled:bg-[#26313A] disabled:text-[#707A82]"
      >
        {nextLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{getNextLabel()}</span>
            {getNextIcon()}
          </>
        )}
      </button>
    </div>
  );
}
