"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBooking } from "@/context/BookingProvider";
import BookingHeader from "./BookingHeader";
import BookingStepper from "./BookingStepper";
import BookingWizard from "./BookingWizard";

export default function BookingDrawer() {
  const { isOpen, closeBooking, currentStep } = useBooking();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = parseInt(document.body.style.top || "0", 10) * -1;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    }
  }, [isOpen]);

  // Escape key close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeBooking();
      }
    },
    [isOpen, closeBooking]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeBooking();
    }
  };

  const isSuccess = currentStep >= 6;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            key="booking-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Responsive Drawer Container */}
          <motion.div
            key="booking-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Book a car wash service"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 35 }}
            className="relative z-[1001] flex h-full w-full flex-col bg-[#0D1115] border-l border-[#26313A] shadow-2xl sm:w-[480px] lg:w-[540px]"
          >
            {/* Sticky Header */}
            <div className="shrink-0">
              <BookingHeader />
            </div>

            {/* Stepper — hidden on success screen */}
            {!isSuccess && (
              <div className="shrink-0">
                <BookingStepper />
              </div>
            )}

            {/* Wizard content + Footer */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <BookingWizard />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
