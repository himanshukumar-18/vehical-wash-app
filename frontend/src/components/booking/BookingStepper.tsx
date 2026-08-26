"use client";

import React from "react";
import { Car, Wrench, Calendar, MapPin, ClipboardList, CreditCard, Check } from "lucide-react";
import { useBooking } from "@/context/BookingProvider";

interface Step {
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { label: "Vehicle", icon: <Car size={14} /> },
  { label: "Service", icon: <Wrench size={14} /> },
  { label: "Date", icon: <Calendar size={14} /> },
  { label: "Address", icon: <MapPin size={14} /> },
  { label: "Review", icon: <ClipboardList size={14} /> },
  { label: "Payment", icon: <CreditCard size={14} /> },
];

export default function BookingStepper() {
  const { currentStep } = useBooking();
  const currentStepInfo = STEPS[currentStep] || STEPS[0];

  return (
    <div className="shrink-0 border-b border-[#26313A] bg-[#080A0C] px-4 py-3 sm:px-5 sm:py-3.5">
      {/* MOBILE STEPPER VIEW */}
      <div className="flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center bg-[#19C7F3]/10 border border-[#19C7F3]/40 text-[#19C7F3] font-bold text-xs">
            {currentStep + 1}
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#707A82]">
              Step {currentStep + 1} of {STEPS.length}
            </p>
            <p className="text-xs font-bold text-[#F5F7F8]">{currentStepInfo.label}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-24 overflow-hidden bg-[#0D1115] border border-[#26313A]">
          <div
            className="h-full bg-[#19C7F3] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* DESKTOP STEPPER VIEW */}
      <div className="hidden sm:flex items-center justify-between gap-1">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-1.5">
                <div
                  className={[
                    "flex h-7 w-7 items-center justify-center text-xs font-bold transition-all duration-200",
                    isCompleted
                      ? "bg-[#19C7F3] text-black"
                      : isCurrent
                      ? "border border-[#19C7F3] bg-[#19C7F3]/10 text-[#19C7F3]"
                      : "border border-[#26313A] bg-[#0D1115] text-[#707A82]",
                  ].join(" ")}
                >
                  {isCompleted ? <Check size={13} strokeWidth={2.5} /> : step.icon}
                </div>
                <span
                  className={[
                    "text-[10px] font-bold uppercase tracking-[0.08em]",
                    isCurrent
                      ? "text-[#19C7F3]"
                      : isCompleted
                      ? "text-[#F5F7F8]"
                      : "text-[#707A82]",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={[
                    "h-px flex-1 mx-1 transition-colors duration-300",
                    isCompleted ? "bg-[#19C7F3]" : "bg-[#26313A]",
                  ].join(" ")}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
