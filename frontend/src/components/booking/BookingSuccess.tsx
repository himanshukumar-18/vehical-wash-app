"use client";

import React from "react";
import { CheckCircle2, Calendar, MapPin, ListOrdered, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingProvider";
import { Booking } from "@/lib/api/bookingApi";

interface Props {
  booking: Booking;
}

export default function BookingSuccess({ booking }: Props) {
  const router = useRouter();
  const { resetBooking, closeBooking } = useBooking();

  const handleDone = () => {
    resetBooking();
    closeBooking();
  };

  const handleViewBookings = () => {
    resetBooking();
    closeBooking();
    router.push("/my-booking");
  };

  const formattedDate = booking.booking_date
    ? new Date(booking.booking_date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Scheduled";

  const amountDisplay = booking.total_amount || booking.total_price || 0;

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center max-w-[460px] mx-auto my-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full"
      >
        {/* Success Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#19C7F3]/40 bg-[#19C7F3]/10 text-[#19C7F3]">
          <CheckCircle2 size={36} />
        </div>

        <h2 className="font-heading text-2xl font-bold text-[#F5F7F8] tracking-tight sm:text-3xl">
          Booking Confirmed!
        </h2>
        <p className="mt-2 text-xs text-[#A7B0B7] leading-relaxed">
          Your car wash booking has been received and assigned to our doorstep team.
        </p>

        {/* Reference Card */}
        <div className="mt-6 border border-[#26313A] bg-[#0D1115] p-5 text-left space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#707A82]">
              Booking Reference
            </span>
            <p className="mt-0.5 text-base font-extrabold text-[#19C7F3] font-mono">
              #{booking.booking_number || String(booking.id)}
            </p>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-[#26313A] text-xs">
            <Calendar size={15} className="text-[#19C7F3] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#F5F7F8]">{formattedDate}</p>
              <p className="text-[#707A82] text-[11px]">
                Total: ₹{amountDisplay} &bull; Status:{" "}
                <span className="text-emerald-400 font-bold uppercase">{booking.status}</span>
              </p>
            </div>
          </div>

          {booking.address && (
            <div className="flex items-start gap-2.5 pt-2 border-t border-[#26313A] text-xs">
              <MapPin size={15} className="text-[#19C7F3] shrink-0 mt-0.5" />
              <p className="text-[#A7B0B7] leading-snug">{booking.address}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleViewBookings}
            className="flex h-11 w-full items-center justify-center gap-2 bg-[#19C7F3] text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:bg-[#0FA9D1]"
          >
            <ListOrdered size={16} /> View My Bookings
          </button>

          <button
            type="button"
            onClick={handleDone}
            className="flex h-11 w-full items-center justify-center gap-2 border border-[#26313A] bg-[#080A0C] text-xs font-bold uppercase tracking-[0.08em] text-[#F5F7F8] transition hover:border-[#19C7F3]/50 hover:text-[#19C7F3]"
          >
            <Home size={16} /> Return to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
