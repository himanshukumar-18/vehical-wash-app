"use client";

import React from "react";
import { Booking } from "@/lib/api/bookingApi";
import { Calendar, MapPin, KeyRound, ArrowRight, XCircle } from "lucide-react";

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
}

const STATUS_PILLS: Record<
  string,
  { label: string; badgeClass: string }
> = {
  pending: { label: "Pending Confirmation", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  confirmed: { label: "Confirmed", badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  in_progress: { label: "Washing In Progress", badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  completed: { label: "Completed", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Cancelled", badgeClass: "bg-red-500/10 text-red-400 border-red-500/30" },
  refunded: { label: "Refunded", badgeClass: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
};

const PAYMENT_PILLS: Record<
  string,
  { label: string; badgeClass: string }
> = {
  pending: { label: "Cash Pay on Visit", badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  paid: { label: "Paid", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  failed: { label: "Payment Failed", badgeClass: "bg-red-500/10 text-red-400 border-red-500/20" },
  refunded: { label: "Refunded", badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
};

export default function BookingCard({
  booking,
  onViewDetails,
  onCancel,
  cancelling,
}: BookingCardProps) {
  const statusInfo = STATUS_PILLS[booking.status] || STATUS_PILLS.pending;
  const paymentInfo = PAYMENT_PILLS[booking.payment_status] || PAYMENT_PILLS.pending;
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  const dateStr = booking.booking_date || booking.created_at?.split("T")[0] || "";
  const formattedDate = dateStr
    ? new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Scheduled";

  const vehicleName =
    typeof booking.vehicle === "object" && booking.vehicle
      ? `${booking.vehicle.brand || ""} ${booking.vehicle.model || booking.vehicle.name || ""}`.trim()
      : String(booking.vehicle || "Vehicle");

  const registrationNo =
    typeof booking.vehicle === "object" && booking.vehicle?.registration_number
      ? booking.vehicle.registration_number
      : "";

  const serviceName =
    typeof booking.service === "object" && booking.service
      ? booking.service.name
      : String(booking.service || "Car Wash Service");

  const totalAmount = booking.total_amount || booking.total_price || 0;
  const travelCharge = Number(booking.travel_charge || 0);
  const discount = Number(booking.discount || 0);
  const otpCode = booking.arrival_otp;

  return (
    <article className="flex flex-col border border-[#26313A] bg-[#0D1115] p-4 sm:p-5 transition-all hover:border-[#19C7F3]/40 shadow-lg">
      {/* Header Row: ID, Status & Payment Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#26313A]">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#707A82]">
            Ref ID
          </span>
          <p className="font-mono text-xs sm:text-sm font-bold text-[#F5F7F8]">
            #{booking.booking_number || String(booking.id)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </span>
          <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${paymentInfo.badgeClass}`}>
            {paymentInfo.label}
          </span>
        </div>
      </div>

      {/* Main Body: Service & Vehicle */}
      <div className="my-3 flex flex-col gap-1.5">
        <h3 className="font-bold text-base sm:text-lg text-[#F5F7F8] tracking-tight">
          {serviceName}
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#A7B0B7]">
          <span className="font-semibold text-[#19C7F3]">{vehicleName}</span>
          {registrationNo && (
            <span className="font-mono text-[11px] bg-[#080A0C] border border-[#26313A] px-1.5 py-0.5 text-[#707A82]">
              {registrationNo}
            </span>
          )}
          <span className="flex items-center gap-1 text-[#707A82]">
            <Calendar size={13} /> {formattedDate}
          </span>
        </div>
      </div>

      {/* Location Address */}
      {booking.address && (
        <div className="flex items-start gap-2 border-t border-[#1D252B] pt-2.5 text-xs text-[#A7B0B7]">
          <MapPin size={14} className="text-[#19C7F3] shrink-0 mt-0.5" />
          <p className="line-clamp-2 text-[11px] leading-relaxed">
            {booking.address}
          </p>
        </div>
      )}

      {/* High-Visibility Arrival OTP Display */}
      {otpCode && (booking.status === "pending" || booking.status === "confirmed" || booking.status === "in_progress") && (
        <div className="mt-3 flex items-center justify-between border border-[#19C7F3]/40 bg-[#19C7F3]/10 p-2.5">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-[#19C7F3] shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#19C7F3]">
                Customer Arrival OTP
              </p>
              <p className="text-[11px] text-[#A7B0B7]">
                Share code with washing technician upon arrival
              </p>
            </div>
          </div>
          <span className="font-mono text-base font-black tracking-widest text-[#19C7F3] bg-[#080A0C] border border-[#19C7F3]/50 px-2.5 py-1">
            {otpCode}
          </span>
        </div>
      )}

      {/* Footer Row: Total Price & Mobile Touch Action Buttons */}
      <div className="mt-4 pt-3 border-t border-[#26313A] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#707A82]">
            Total Amount
          </span>
          <div className="flex items-baseline gap-2">
            <p className="font-bold text-lg text-[#19C7F3]">
              ₹{Number(totalAmount).toFixed(2)}
            </p>
            {travelCharge > 0 && (
              <span className="text-[10px] text-[#707A82]">
                (includes ₹{travelCharge} travel fee)
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] text-emerald-400 font-semibold">
                (-₹{discount} offer)
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onViewDetails(booking)}
            className="flex-1 sm:flex-initial h-10 min-h-[44px] px-4 inline-flex items-center justify-center gap-1.5 border border-[#19C7F3] bg-[#19C7F3]/10 text-xs font-bold uppercase tracking-wider text-[#19C7F3] transition hover:bg-[#19C7F3] hover:text-black"
          >
            Details <ArrowRight size={13} />
          </button>

          {canCancel && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(String(booking.id))}
              disabled={cancelling}
              className="h-10 min-h-[44px] px-3 inline-flex items-center justify-center gap-1 border border-red-500/40 bg-red-500/10 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              <XCircle size={13} /> {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
