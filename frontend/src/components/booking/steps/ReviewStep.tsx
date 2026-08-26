"use client";

import React, { useEffect, useState } from "react";
import { Tag, FileText, Receipt, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { useBooking } from "../../../context/BookingProvider";
import axiosInstance from "@/lib/axios";

function formatCurrency(amount: number): string {
  return (amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ReviewStep() {
  const {
    vehicle,
    service,
    date,
    addressDetails,
    address,
    notes,
    setNotes,
  } = useBooking();

  const [priceData, setPriceData] = useState<{
    service_price: number;
    travel_charge: number;
    subtotal: number;
    discount: number;
    tax: number;
    final_amount: number;
    offer_name?: string;
    service_area_name?: string;
    is_service_area_supported?: boolean;
    service_area_message?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const formattedLocation = address || [
    addressDetails.address,
    addressDetails.area,
    addressDetails.city,
    addressDetails.state ? `${addressDetails.state} - ${addressDetails.pincode}` : addressDetails.pincode,
  ].filter(Boolean).join(", ");

  useEffect(() => {
    if (!service?.id) return;
    setLoading(true);

    axiosInstance
      .post("bookings/price-preview/", {
        service: service.id,
        address: formattedLocation,
        booking_date: date,
      })
      .then((res) => {
        setPriceData(res.data);
      })
      .catch((err) => {
        console.error("Price preview calculation failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [service?.id, formattedLocation, date]);

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const numericServicePrice = typeof service?.price === "number" ? service.price : parseFloat(String(service?.price || 0));
  const servicePrice = priceData?.service_price ?? numericServicePrice;
  const travelCharge = priceData?.travel_charge ?? 0;
  const subtotal = priceData?.subtotal ?? servicePrice + travelCharge;
  const discount = priceData?.discount ?? 0;
  const tax = 0;
  const finalAmount = priceData?.final_amount ?? Math.round((subtotal - discount) * 100) / 100;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-bold text-[#F5F7F8] mb-0.5">
          Review Your Booking
        </h3>
        <p className="text-xs text-[#A7B0B7]">
          Confirm your service details and mobile wash location before payment.
        </p>
      </div>

      {/* Unsupported Service Area Alert */}
      {priceData && priceData.is_service_area_supported === false && (
        <div className="flex items-center gap-2 border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-bold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{priceData.service_area_message || "Sorry, we currently do not serve this location."}</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="border border-[#26313A] bg-[#0D1115] p-4">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#19C7F3] pb-2 border-b border-[#26313A] mb-3">
          Booking Details
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-start">
            <span className="text-[#707A82]">Vehicle</span>
            <span className="font-bold text-[#F5F7F8] text-right">
              {vehicle
                ? `${vehicle.brand} ${vehicle.model || ""} (${vehicle.registration_number.toUpperCase()})`
                : "—"}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-[#707A82]">Service</span>
            <span className="font-bold text-[#F5F7F8] text-right">{service?.name ?? "—"}</span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-[#707A82]">Service Date</span>
            <span className="font-bold text-[#F5F7F8] text-right">{formattedDate}</span>
          </div>

          <div className="flex justify-between items-start pt-1">
            <span className="text-[#707A82]">Location</span>
            <span className="font-bold text-[#19C7F3] text-right max-w-[65%] leading-tight flex items-center gap-1 justify-end">
              <MapPin size={12} className="shrink-0" />
              {formattedLocation || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border border-[#26313A] bg-[#0D1115] p-4">
        <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-[#26313A]">
          <Receipt size={15} className="text-[#19C7F3]" />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#19C7F3]">
            Price Breakdown (Backend Calculated)
          </h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-[#A7B0B7]">
            <span>Service Base Price</span>
            <span>₹{formatCurrency(servicePrice)}</span>
          </div>

          <div className="flex justify-between items-center text-[#A7B0B7]">
            <span>Doorstep Travel Fee ({priceData?.service_area_name || "Zone"})</span>
            <span>₹{formatCurrency(travelCharge)}</span>
          </div>

          <div className="flex justify-between items-center font-semibold text-[#F5F7F8] pt-1 border-t border-[#1D252B]">
            <span>Subtotal</span>
            <span>₹{formatCurrency(subtotal)}</span>
          </div>

          {/* Automatic Best Offer Discount */}
          {discount > 0 ? (
            <div className="flex justify-between items-center text-emerald-400 font-semibold bg-emerald-500/10 p-2 border border-emerald-500/20 my-1">
              <div className="flex items-center gap-1.5">
                <Tag size={13} />
                <span>{priceData?.offer_name || "Automatic Best Offer"}</span>
              </div>
              <span className="font-bold">− ₹{formatCurrency(discount)}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center text-[#707A82] text-[11px]">
              <span>Automatic Offer</span>
              <span>No active offer applicable</span>
            </div>
          )}

          {/* Total Payable */}

          <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-[#26313A] text-sm">
            <span className="font-bold text-[#F5F7F8]">Total Payable Amount</span>
            <span className="font-extrabold text-base text-[#19C7F3]">
              ₹{formatCurrency(finalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Notes */}
      <div className="border border-[#26313A] bg-[#0D1115] p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={15} className="text-[#707A82]" />
          <span className="text-xs font-bold text-[#F5F7F8]">Special Instructions (Optional)</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions for our van technician..."
          rows={2}
          className="w-full border border-[#26313A] bg-[#080A0C] p-2.5 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3] resize-none"
        />
      </div>
    </div>
  );
}
