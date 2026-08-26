"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Car,
  CalendarDays,
  MapPin,
  Clock,
  Receipt,
  CreditCard,
  FileText,
  Banknote,
  KeyRound,
} from "lucide-react";
import { Booking } from "@/lib/api/bookingApi";

interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
  onCancel?: (booking: Booking) => void;
}

const STATUS_CONFIG: Record<
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

const PAYMENT_STATUS: Record<
  string,
  { label: string; badgeClass: string }
> = {
  pending: { label: "Payment Pending", badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  paid: { label: "Paid", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  failed: { label: "Failed", badgeClass: "bg-red-500/10 text-red-400 border-red-500/20" },
  refunded: { label: "Refunded", badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
};

function formatTime(timeStr: string): string {
  if (!timeStr) return "--:--";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${period}`;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#1D252B]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#080A0C] border border-[#26313A] text-[#19C7F3]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#707A82]">
          {label}
        </p>
        <div className="text-xs font-semibold text-[#F5F7F8] mt-0.5 break-words">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailsModal({
  booking,
  onClose,
  onCancel,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const statusConfig = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const paymentConfig = PAYMENT_STATUS[booking.payment_status] ?? PAYMENT_STATUS.pending;

  const dateStr = booking.booking_date || (booking.slot && typeof booking.slot === "object" ? booking.slot.date : null) || booking.created_at?.split("T")[0] || "";
  const formattedDate = dateStr
    ? new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Scheduled";

  const bookedOn = booking.created_at
    ? new Date(booking.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recent";

  const vehicleInfo =
    typeof booking.vehicle === "object" && booking.vehicle
      ? `${booking.vehicle.brand || ""} ${booking.vehicle.model || booking.vehicle.name || ""}`.trim()
      : String(booking.vehicle || "Vehicle");

  const serviceInfo =
    typeof booking.service === "object" && booking.service
      ? booking.service.name
      : String(booking.service || "Service");

  const basePriceNum = Number(booking.base_price || 0);
  const travelChargeNum = Number(booking.travel_charge || 0);
  const discountNum = Number(booking.discount || 0);
  const taxNum = Number(booking.tax || 0);
  const totalNum = Number(booking.total_amount || booking.total_price || 0);
  const offerName = booking.offer_name_snapshot || "";
  const otpCode = booking.arrival_otp;

  const notesContent = booking.customer_note || booking.notes;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          key="modal-panel"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col w-full max-w-lg max-h-[90dvh] bg-[#0D1115] border border-[#26313A] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#26313A] bg-[#080A0C]">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#F5F7F8]">
                Booking Details
              </h2>
              <p className="text-[11px] text-[#707A82]">
                Booked on {bookedOn}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${statusConfig.badgeClass}`}>
                {statusConfig.label}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center border border-[#26313A] bg-[#0D1115] text-[#707A82] transition hover:border-[#19C7F3] hover:text-[#19C7F3]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Reference Header Card */}
            <div className="flex items-center justify-between p-3 border border-[#26313A] bg-[#080A0C]">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#707A82]">
                  Booking Reference
                </span>
                <p className="font-mono text-base font-bold text-[#19C7F3]">
                  #{booking.booking_number || String(booking.id)}
                </p>
              </div>

              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${paymentConfig.badgeClass}`}>
                {paymentConfig.label}
              </span>
            </div>

            {/* Arrival OTP Display */}
            {otpCode && (booking.status === "pending" || booking.status === "confirmed" || booking.status === "in_progress") && (
              <div className="flex items-center justify-between border border-[#19C7F3]/40 bg-[#19C7F3]/10 p-3">
                <div className="flex items-center gap-2.5">
                  <KeyRound size={18} className="text-[#19C7F3] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#19C7F3]">
                      Customer Arrival Verification OTP
                    </p>
                    <p className="text-[11px] text-[#A7B0B7]">
                      Provide code to service technician when van arrives
                    </p>
                  </div>
                </div>
                <span className="font-mono text-lg font-black tracking-widest text-[#19C7F3] bg-[#080A0C] border border-[#19C7F3] px-3 py-1">
                  {otpCode}
                </span>
              </div>
            )}

            {/* Service & Location Details */}
            <div className="space-y-1">
              <InfoRow icon={<Car size={16} />} label="Vehicle" value={vehicleInfo} />
              <InfoRow icon={<FileText size={16} />} label="Service Package" value={serviceInfo} />
              <InfoRow icon={<CalendarDays size={16} />} label="Preferred Service Date" value={formattedDate} />
              <InfoRow icon={<MapPin size={16} />} label="Service Location" value={booking.address || "Customer Location"} />

              {booking.slot && typeof booking.slot === "object" && booking.slot.start_time && (
                <InfoRow
                  icon={<Clock size={16} />}
                  label="Slot Time"
                  value={`${formatTime(booking.slot.start_time)} – ${formatTime(booking.slot.end_time)}`}
                />
              )}

              <InfoRow
                icon={booking.payment_method === "razorpay" ? <CreditCard size={16} /> : <Banknote size={16} />}
                label="Payment Mode"
                value={booking.payment_method === "razorpay" ? "Online (Razorpay)" : "Cash Pay on Visit"}
              />
            </div>

            {/* Price Breakdown */}
            <div className="border border-[#26313A] bg-[#080A0C] p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b border-[#26313A]">
                <Receipt size={14} className="text-[#19C7F3]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#19C7F3]">
                  Price Breakdown
                </span>
              </div>

              <div className="flex justify-between text-[#A7B0B7]">
                <span>Service Base Price</span>
                <span className="text-[#F5F7F8] font-semibold">₹{basePriceNum.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[#A7B0B7]">
                <span>Doorstep Travel Fee</span>
                <span className="text-[#F5F7F8] font-semibold">₹{travelChargeNum.toFixed(2)}</span>
              </div>

              {discountNum > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/10 p-1.5 border border-emerald-500/20">
                  <span>Offer Discount {offerName ? `(${offerName})` : ""}</span>
                  <span>− ₹{discountNum.toFixed(2)}</span>
                </div>
              )}

              {/* Total Amount */}

              <div className="flex justify-between items-center text-sm font-bold text-[#F5F7F8] pt-2 border-t border-[#26313A]">
                <span>Total Amount</span>
                <span className="text-base text-[#19C7F3]">₹{totalNum.toFixed(2)}</span>
              </div>
            </div>

            {/* Special Instructions Note */}
            {notesContent && (
              <div className="border border-[#26313A] bg-[#080A0C] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                  Customer Instructions
                </p>
                <p className="text-xs text-[#F5F7F8] leading-relaxed">
                  {notesContent}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[#26313A] bg-[#080A0C] flex items-center justify-end gap-3">
            {onCancel && (booking.status === "pending" || booking.status === "confirmed") && (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                className="h-10 min-h-[44px] px-4 text-xs font-bold uppercase tracking-wider border border-red-500/40 bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                Cancel Booking
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-10 min-h-[44px] px-5 text-xs font-bold uppercase tracking-wider border border-[#26313A] bg-[#19C7F3] text-black transition hover:bg-[#19C7F3]/90"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
