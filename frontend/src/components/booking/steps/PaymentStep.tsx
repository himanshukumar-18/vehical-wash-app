"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IndianRupee, CreditCard, Banknote, Shield, Check } from "lucide-react";
import { AppDispatch } from "@/lib/store";
import { useBooking } from "@/context/BookingProvider";
import { selectPriceSummary } from "@/lib/slices/bookingSlice";
import {
  createPaymentOrder,
  verifyPayment,
  selectPaymentLoading,
  selectPaymentVerifying,
  selectPaymentError,
} from "@/lib/slices/paymentSlice";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentStepRef {
  initiatePayment: (bookingId: string) => Promise<boolean>;
}

function formatCurrency(amount: number): string {
  return (amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PaymentStep = forwardRef<PaymentStepRef>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const priceSummary = useSelector(selectPriceSummary);
  const paymentLoading = useSelector(selectPaymentLoading);
  const paymentVerifying = useSelector(selectPaymentVerifying);
  const paymentError = useSelector(selectPaymentError);
  const { paymentMethod, setPaymentMethod, service } = useBooking();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useImperativeHandle(ref, () => ({
    initiatePayment: async (bookingId: string): Promise<boolean> => {
      if (paymentMethod === "cash") {
        return true;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) return false;

      const orderResult = await dispatch(createPaymentOrder(bookingId));
      if (!createPaymentOrder.fulfilled.match(orderResult)) return false;

      const order = orderResult.payload;
      const rzpKey = order.razorpay_key || order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY || "";
      const rzpOrderId = order.razorpay_order_id || order.order_id || "";

      if (!rzpKey) {
        alert("Razorpay Key ID is not configured. Please select 'Pay Cash on Delivery' or set RAZORPAY_KEY_ID in backend.");
        return false;
      }

      return new Promise<boolean>((resolve) => {
        const rzp = new window.Razorpay({
          key: rzpKey,
          amount: order.amount,
          currency: order.currency,
          name: "The Black Wash",
          description: service?.name ?? "Car Wash Service",
          order_id: rzpOrderId,
          handler: async (response: RazorpayResponse) => {
            const verifyResult = await dispatch(
              verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: bookingId,
              })
            );
            const success = verifyPayment.fulfilled.match(verifyResult);
            setPaymentSuccess(success);
            resolve(success);
          },
          modal: {
            ondismiss: () => resolve(false),
          },
          theme: { color: "#19C7F3" },
        });
        rzp.open();
      });
    },
  }));

  const numericServicePrice = typeof service?.price === "number" ? service.price : parseFloat(String(service?.price || 0));
  const basePrice = priceSummary?.base_price ?? numericServicePrice;
  const tax = 0;
  const discount = priceSummary?.discount ?? 0;
  const price = priceSummary?.total_price ?? priceSummary?.total_amount ?? Math.round((basePrice - discount) * 100) / 100;

  const isLoading = paymentLoading || paymentVerifying;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-bold text-[#F5F7F8] mb-0.5">
          Select Payment Method
        </h3>
        <p className="text-xs text-[#A7B0B7]">
          Choose how you'd like to pay for your car wash.
        </p>
      </div>

      {/* Payment Options */}
      <div className="flex flex-col gap-2.5">
        {/* Razorpay */}
        <button
          type="button"
          onClick={() => setPaymentMethod("razorpay")}
          className={[
            "flex items-center justify-between gap-3 p-4 border text-left transition-all",
            paymentMethod === "razorpay"
              ? "border-[#19C7F3] bg-[#19C7F3]/10 text-[#F5F7F8]"
              : "border-[#26313A] bg-[#0D1115] text-[#A7B0B7] hover:border-[#19C7F3]/50",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center border",
                paymentMethod === "razorpay"
                  ? "bg-[#19C7F3] text-black border-[#19C7F3]"
                  : "bg-[#080A0C] text-[#19C7F3] border-[#26313A]",
              ].join(" ")}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-[#F5F7F8]">Pay Online (Razorpay)</p>
              <p className="text-xs text-[#707A82]">UPI, Credit/Debit Card, NetBanking, Wallets</p>
            </div>
          </div>

          {paymentMethod === "razorpay" && (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#19C7F3] text-black font-bold">
              <Check size={14} strokeWidth={2.5} />
            </div>
          )}
        </button>

        {/* Cash */}
        <button
          type="button"
          onClick={() => setPaymentMethod("cash")}
          className={[
            "flex items-center justify-between gap-3 p-4 border text-left transition-all",
            paymentMethod === "cash"
              ? "border-[#19C7F3] bg-[#19C7F3]/10 text-[#F5F7F8]"
              : "border-[#26313A] bg-[#0D1115] text-[#A7B0B7] hover:border-[#19C7F3]/50",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center border",
                paymentMethod === "cash"
                  ? "bg-[#19C7F3] text-black border-[#19C7F3]"
                  : "bg-[#080A0C] text-[#19C7F3] border-[#26313A]",
              ].join(" ")}
            >
              <Banknote size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-[#F5F7F8]">Pay Cash on Service</p>
              <p className="text-xs text-[#707A82]">Pay technician directly after doorstep wash</p>
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#19C7F3] text-black font-bold">
              <Check size={14} strokeWidth={2.5} />
            </div>
          )}
        </button>
      </div>

      {/* Final Price Summary Card */}
      <div className="border border-[#26313A] bg-[#0D1115] p-4">
        <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-[#26313A]">
          <IndianRupee size={15} className="text-[#19C7F3]" />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#19C7F3]">
            Total Amount Due
          </h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-[#A7B0B7]">
            <span>Base Price</span>
            <span>₹{formatCurrency(basePrice)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-emerald-400 font-semibold">
              <span>Discount</span>
              <span>− ₹{formatCurrency(discount)}</span>
            </div>
          )}

          {/* Total Payable */}

          <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-[#26313A] text-sm">
            <span className="font-bold text-[#F5F7F8]">Total Payable</span>
            <span className="font-extrabold text-lg text-[#19C7F3]">
              ₹{formatCurrency(price)}
            </span>
          </div>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2.5 border border-[#26313A] bg-[#080A0C] p-3 text-xs text-[#707A82]">
        <Shield size={16} className="text-[#19C7F3] shrink-0" />
        <span>256-bit SSL encrypted & secure transaction. Guaranteed doorstep vehicle care.</span>
      </div>

      {paymentError && (
        <div className="border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
          {paymentError}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 p-3 text-xs font-bold text-[#19C7F3]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#19C7F3] border-t-transparent" />
          <span>Processing payment transaction...</span>
        </div>
      )}
    </div>
  );
});

PaymentStep.displayName = "PaymentStep";

export default PaymentStep;
