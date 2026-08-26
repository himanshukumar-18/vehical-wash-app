"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#050708] px-4 py-12 text-center text-[#F5F7F8]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center border border-[#19C7F3]/40 bg-[#19C7F3]/10 text-[#19C7F3] mb-6">
        <WifiOff size={36} />
      </div>

      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#19C7F3] mb-2">
        Connection Interrupted
      </span>

      <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F5F7F8] max-w-md">
        You Are Currently Offline
      </h1>

      <p className="mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-[#A7B0B7]">
        Please reconnect to the internet to browse car wash services, view scheduled appointments, or complete payments.
      </p>

      <div className="mt-4 border border-[#26313A] bg-[#0D1115] p-3 text-[11px] text-[#707A82] max-w-sm">
        💡 Note: Doorstep wash booking creation and Razorpay payment verification require an active network connection.
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center">
        <button
          type="button"
          onClick={handleReload}
          className="inline-flex h-11 items-center justify-center gap-2 border border-[#19C7F3] bg-[#19C7F3] px-6 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-[#19C7F3]/90 active:scale-[0.98]"
        >
          <RefreshCw size={15} /> Try Again
        </button>

        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 border border-[#26313A] bg-[#0D1115] px-6 text-xs font-bold uppercase tracking-wider text-[#F5F7F8] transition hover:border-[#19C7F3] active:scale-[0.98]"
        >
          <ArrowLeft size={15} /> Return Home
        </Link>
      </div>
    </div>
  );
}
