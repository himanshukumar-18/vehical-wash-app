"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  CalendarDays,
  Plus,
  RefreshCw,
  Search,
  XCircle,
  X,
} from "lucide-react";

import { AppDispatch } from "@/lib/store";
import { fetchMyBookings, cancelBooking, selectBookings, selectBookingLoading, selectBookingError } from "@/lib/slices/bookingSlice";
import { fetchProfile } from "@/lib/authSlice";
import { useBooking } from "@/context/BookingProvider";
import { Booking } from "@/lib/api/bookingApi";
import BookingCard from "@/components/bookings/BookingCard";
import BookingDetailsModal from "@/components/bookings/BookingDetailsModal";

const TABS = ["all", "upcoming", "completed", "cancelled"] as const;
type TabType = (typeof TABS)[number];

export default function MyBookingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { openBooking } = useBooking();

  const bookings = useSelector(selectBookings);
  const loading = useSelector(selectBookingLoading);
  const error = useSelector(selectBookingError);

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  // Authentication check
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      router.replace("/login?next=/my-booking");
      return;
    }
    dispatch(fetchProfile() as any);
    dispatch(fetchMyBookings());
  }, [dispatch, router]);

  // Tab Filtering Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.trim().toLowerCase();
      const serviceName = typeof b.service === "object" ? b.service?.name || "" : String(b.service || "");
      const vehicleName = typeof b.vehicle === "object" ? `${b.vehicle?.brand || ""} ${b.vehicle?.model || ""}` : String(b.vehicle || "");
      const refNum = b.booking_number || String(b.id);

      const matchesSearch =
        !q ||
        refNum.toLowerCase().includes(q) ||
        serviceName.toLowerCase().includes(q) ||
        vehicleName.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === "upcoming") {
        return b.status === "pending" || b.status === "confirmed" || b.status === "in_progress";
      } else if (activeTab === "completed") {
        return b.status === "completed";
      } else if (activeTab === "cancelled") {
        return b.status === "cancelled";
      }
      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  const countByTab = (tab: TabType) => {
    if (tab === "upcoming") return bookings.filter((b) => b.status === "pending" || b.status === "confirmed" || b.status === "in_progress").length;
    if (tab === "completed") return bookings.filter((b) => b.status === "completed").length;
    if (tab === "cancelled") return bookings.filter((b) => b.status === "cancelled").length;
    return bookings.length;
  };

  const handleCancelConfirm = async () => {
    if (!cancelModalBooking) return;
    const idStr = String(cancelModalBooking.id);
    setCancellingId(idStr);
    try {
      await dispatch(cancelBooking(idStr)).unwrap();
      setCancelModalBooking(null);
      dispatch(fetchMyBookings());
    } catch (err) {
      console.error("Cancellation failed:", err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-dvh pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-12 max-w-[1200px] w-full mx-auto">
      {/* PAGE HEADER WITH GENEROUS TOP CLEARANCE */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-[#26313A]">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-px w-5 bg-[#19C7F3]" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#19C7F3]">
              Account Workspace
            </span>
          </div>
          <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-[#F5F7F8]">
            My Bookings
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-[#A7B0B7]">
            Track and manage your scheduled doorstep car wash appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openBooking()}
          className="inline-flex h-11 min-h-[44px] items-center justify-center gap-2 bg-[#19C7F3] px-5 text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:bg-[#19C7F3]/90 active:scale-[0.98] shrink-0"
        >
          <Plus size={16} /> Book New Wash
        </button>
      </div>

      {/* TOOLBAR & TABS */}
      <div className="flex flex-col gap-3 mb-6 w-full max-w-full">
        {/* Horizontal Touch Scrollable Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full w-full pb-2 no-scrollbar touch-pan-x flex-nowrap min-w-0">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  "shrink-0 inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-bold uppercase tracking-[0.08em] transition-all cursor-pointer",
                  active
                    ? "bg-[#19C7F3] text-black shadow-[0_0_12px_rgba(25,199,243,0.3)]"
                    : "bg-[#0D1115] text-[#A7B0B7] hover:text-[#F5F7F8] border border-[#26313A]",
                ].join(" ")}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${active ? "bg-black/20 text-black" : "bg-[#080A0C] text-[#707A82] border border-[#26313A]"}`}>
                  {countByTab(tab)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A82]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Booking ID, service, or vehicle..."
            className="h-11 min-h-[44px] w-full border border-[#26313A] bg-[#0D1115] pl-10 pr-10 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707A82] hover:text-[#F5F7F8]"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* CONTENT STATES */}
      {loading ? (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[#26313A] bg-[#0D1115] p-5 animate-pulse space-y-4">
              <div className="h-4 w-24 bg-[#080A0C] rounded" />
              <div className="h-6 w-3/4 bg-[#080A0C] rounded" />
              <div className="h-4 w-1/2 bg-[#080A0C] rounded" />
              <div className="h-10 w-full bg-[#080A0C] rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="border border-red-500/20 bg-red-500/5 p-6 sm:p-8 text-center my-6">
          <XCircle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-xs sm:text-sm font-semibold text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => dispatch(fetchMyBookings())}
            className="inline-flex h-10 min-h-[44px] items-center gap-2 border border-[#19C7F3] px-4 py-2 text-xs font-bold text-[#19C7F3] hover:bg-[#19C7F3] hover:text-black"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="border border-[#26313A] bg-[#0D1115] py-12 px-4 text-center my-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-[#26313A] bg-[#080A0C] text-[#19C7F3]">
            <CalendarDays size={22} />
          </div>
          <h3 className="text-base font-bold text-[#F5F7F8]">No bookings found</h3>
          <p className="mt-1 max-w-xs mx-auto text-xs text-[#A7B0B7]">
            {searchQuery
              ? "No appointments match your search term."
              : "Book your doorstep car wash and get showroom shine at home."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => openBooking()}
              className="mt-5 inline-flex h-11 min-h-[44px] items-center justify-center gap-2 bg-[#19C7F3] px-6 text-xs font-bold uppercase tracking-[0.08em] text-black hover:bg-[#19C7F3]/90"
            >
              <Plus size={16} /> Book a Wash
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={(b) => setSelectedBooking(b)}
              onCancel={(id) => setCancelModalBooking(booking)}
              cancelling={cancellingId === String(booking.id)}
            />
          ))}
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={(b) => setCancelModalBooking(b)}
        />
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-[#26313A] bg-[#0D1115] p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center bg-red-500/10 border border-red-500/30 text-red-400">
              <XCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-[#F5F7F8]">Cancel this booking?</h3>
            <p className="text-xs text-[#A7B0B7]">
              Are you sure you want to cancel booking #{cancelModalBooking.booking_number || cancelModalBooking.id}?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="h-10 min-h-[44px] px-4 py-2 text-xs font-bold text-[#707A82] hover:text-[#F5F7F8]"
              >
                No, Keep
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={!!cancellingId}
                className="h-10 min-h-[44px] bg-red-500 px-5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
