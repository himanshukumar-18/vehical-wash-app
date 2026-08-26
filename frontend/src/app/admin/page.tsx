"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CalendarCheck,
  Users,
  IndianRupee,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { bookingApi, Booking, DashboardMetrics } from "@/lib/api/bookingApi";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  confirmed: "bg-[#19C7F3]/10 text-[#19C7F3] border-[#19C7F3]/20",
  in_progress: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  cancelled: "bg-red-400/10 text-red-400 border-red-400/20",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, bookingsData] = await Promise.all([
        bookingApi.getDashboard(),
        bookingApi.getAdminAll(),
      ]);
      setMetrics(dashData);
      setRecentBookings(bookingsData.slice(0, 5));
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err?.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const STAT_CARDS = [
    {
      label: "Total Bookings",
      value: metrics?.total_bookings ?? 0,
      icon: CalendarDays,
    },
    {
      label: "Confirmed / In Progress",
      value: (metrics?.confirmed ?? 0) + (metrics?.in_progress ?? 0),
      icon: CalendarCheck,
    },
    {
      label: "Pending Action",
      value: metrics?.pending ?? 0,
      icon: Users,
    },
    {
      label: "Total Revenue",
      value: metrics?.revenue ?? 0,
      icon: IndianRupee,
      accent: true,
      prefix: "₹",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* PAGE TITLE */}
      <motion.div {...fadeUp(0)} className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-6 bg-[#19C7F3]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#19C7F3]">
              Overview
            </span>
          </div>
          <h1 className="font-bold text-[2rem] tracking-tight text-[#F5F7F8] sm:text-[2.4rem]">
            Dashboard
          </h1>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          className="flex items-center gap-2 border border-[#26313A] bg-[#0D1115] px-3 py-2 text-xs font-semibold text-[#A7B0B7] hover:text-[#19C7F3]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </motion.div>

      {error ? (
        <div className="p-8 border border-red-500/20 bg-red-500/5 text-center mb-8">
          <p className="text-sm font-semibold text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={loadDashboardData}
            className="px-4 py-2 bg-[#19C7F3] text-black text-xs font-bold"
          >
            Retry Loading
          </button>
        </div>
      ) : null}

      {/* STAT CARDS */}
      <motion.div
        {...fadeUp(0.08)}
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {STAT_CARDS.map(({ label, value, icon: Icon, accent, prefix }) => (
          <div
            key={label}
            className={[
              "relative overflow-hidden border p-5 transition-all duration-300",
              "hover:border-[#3B4A54] hover:bg-[#12171C]",
              accent ? "border-[#19C7F3]/20 bg-[#19C7F3]/[0.04]" : "border-[#26313A] bg-[#0D1115]",
            ].join(" ")}
          >
            {accent && (
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#19C7F3]/10 blur-2xl" />
            )}

            <div className="mb-4 flex items-start justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#707A82]">
                {label}
              </span>
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center",
                  accent ? "bg-[#19C7F3]/15 text-[#19C7F3]" : "bg-[#12171C] text-[#707A82]",
                ].join(" ")}
              >
                <Icon size={15} strokeWidth={1.7} />
              </span>
            </div>

            <p
              className={[
                "font-bold tracking-tight text-[2rem] sm:text-[2.2rem]",
                accent ? "text-[#19C7F3]" : "text-[#F5F7F8]",
              ].join(" ")}
            >
              {loading ? "..." : `${prefix || ""}${value}`}
            </p>
          </div>
        ))}
      </motion.div>

      {/* RECENT BOOKINGS */}
      <motion.div {...fadeUp(0.16)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-base text-[#F5F7F8]">Recent Bookings</h2>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#19C7F3] transition hover:text-[#0FA9D1]"
          >
            View all
            <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="border border-[#26313A] bg-[#0D1115]">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#707A82] animate-pulse">
              Loading recent bookings...
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center border border-[#26313A] bg-[#12171C] text-[#707A82]">
                <CalendarDays size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#A7B0B7]">No bookings found</p>
                <p className="mt-1 text-xs text-[#707A82]">
                  Bookings will appear here once customers book services.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[1.5fr_1fr_1fr_120px_100px] gap-4 border-b border-[#26313A] px-5 py-3 sm:grid">
                {["Booking", "Customer", "Service", "Price", "Status"].map((col) => (
                  <span
                    key={col}
                    className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#707A82]"
                  >
                    {col}
                  </span>
                ))}
              </div>

              {recentBookings.map((booking, index) => {
                const customerName = typeof booking.customer === "object" ? booking.customer?.fullname : String(booking.customer || "Customer");
                const serviceName = typeof booking.service === "object" ? booking.service?.name : String(booking.service || "Wash Service");

                return (
                  <div
                    key={booking.id}
                    className={[
                      "grid grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-[#12171C]",
                      "sm:grid-cols-[1.5fr_1fr_1fr_120px_100px] sm:items-center sm:gap-4",
                      index !== recentBookings.length - 1 ? "border-b border-[#1D252B]" : "",
                    ].join(" ")}
                  >
                    <span className="text-xs font-semibold text-[#F5F7F8]">
                      #{booking.booking_number}
                    </span>
                    <span className="text-xs text-[#A7B0B7]">{customerName}</span>
                    <span className="text-xs text-[#A7B0B7]">{serviceName}</span>
                    <span className="text-xs text-[#707A82]">₹{booking.total_price}</span>
                    <span
                      className={[
                        "inline-flex w-fit items-center border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em]",
                        STATUS_STYLE[booking.status] ?? "bg-[#12171C] text-[#707A82] border-[#26313A]",
                      ].join(" ")}
                    >
                      {STATUS_LABEL[booking.status] ?? booking.status}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}