"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShoppingBag,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { bookingApi, Booking } from "@/lib/api/bookingApi";

// Web Audio API Chime Synthesizer (Mobile-style dual-tone notification sound)
const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio chime playback blocked or unavailable:", e);
  }
};

export default function AdminNotificationBell() {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [clearedAt, setClearedAt] = useState<number | null>(null);
  const [newOrderAnim, setNewOrderAnim] = useState(false);

  const lastSeenIdRef = useRef<string | number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load mute setting & cleared timestamp from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("tbw_admin_bell_muted");
      if (savedMute !== null) {
        setIsMuted(savedMute === "true");
      }
      const savedCleared = localStorage.getItem("tbw_admin_bell_cleared_at");
      if (savedCleared) {
        setClearedAt(parseInt(savedCleared, 10));
      }
    }
  }, []);

  // Poll for latest admin bookings every 8 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchLatestOrders = async () => {
      try {
        const data = await bookingApi.getAdminAll();
        if (!isMounted || !Array.isArray(data)) return;

        // Sort descending by created_at or ID
        const sorted = [...data].sort((a, b) => {
          const tA = new Date(a.created_at).getTime();
          const tB = new Date(b.created_at).getTime();
          return tB - tA;
        });

        // Check if there is a brand new order
        if (sorted.length > 0) {
          const topOrder = sorted[0];
          if (lastSeenIdRef.current !== null && lastSeenIdRef.current !== topOrder.id) {
            // New order received!
            setNewOrderAnim(true);
            setTimeout(() => setNewOrderAnim(false), 3000);

            // Play notification sound if not muted
            const mutedState = localStorage.getItem("tbw_admin_bell_muted") === "true";
            if (!mutedState) {
              playNotificationChime();
            }
          }
          lastSeenIdRef.current = topOrder.id;
        }

        setOrders(sorted);
      } catch (err) {
        // Silent catch for background polling
      }
    };

    fetchLatestOrders();
    const interval = setInterval(fetchLatestOrders, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    localStorage.setItem("tbw_admin_bell_muted", String(nextState));
    if (!nextState) {
      playNotificationChime(); // Play test chime when unmuted
    }
  };

  const handleClearHistory = () => {
    const now = Date.now();
    setClearedAt(now);
    localStorage.setItem("tbw_admin_bell_cleared_at", String(now));
  };

  // Filter visible top 5 latest orders created after clear history timestamp
  const visibleOrders = orders.filter((order) => {
    if (!clearedAt) return true;
    const orderTime = new Date(order.created_at).getTime();
    return orderTime > clearedAt;
  }).slice(0, 5);

  const formatOrderTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "border-amber-500/40 text-amber-400 bg-amber-500/10";
      case "confirmed":
        return "border-[#19C7F3]/40 text-[#19C7F3] bg-[#19C7F3]/10";
      case "in_progress":
        return "border-purple-500/40 text-purple-400 bg-purple-500/10";
      case "completed":
        return "border-emerald-500/40 text-emerald-400 bg-emerald-500/10";
      default:
        return "border-gray-500/40 text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className={`relative flex h-10 w-10 items-center justify-center border border-[#26313A] bg-[#0D1115] text-[#A7B0B7] transition-all hover:border-[#19C7F3]/50 hover:text-[#19C7F3] active:scale-95 ${
          newOrderAnim ? "animate-bounce border-[#19C7F3] text-[#19C7F3]" : ""
        }`}
      >
        <Bell size={18} strokeWidth={1.8} />

        {/* MUTE STATUS ICON OVERLAY */}
        {isMuted && (
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[#080A0C] p-0.5 text-[#707A82]">
            <VolumeX size={10} />
          </span>
        )}

        {/* UNREAD BADGE COUNTER */}
        {visibleOrders.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#19C7F3] px-1 text-[9px] font-bold text-black shadow-[0_0_8px_rgba(25,199,243,0.6)]">
            {visibleOrders.length}
          </span>
        )}
      </button>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[320px] sm:w-[360px] border border-[#26313A] bg-[#0D1115] shadow-2xl shadow-black/80 backdrop-blur-md">
          {/* POPUP HEADER */}
          <div className="flex items-center justify-between border-b border-[#26313A] p-3.5">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#19C7F3]" />
              <span className="font-bold text-[#F5F7F8] text-xs uppercase tracking-wider">
                Latest Orders ({visibleOrders.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* MUTE / UNMUTE TOGGLE BUTTON */}
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? "Unmute sound alerts" : "Mute sound alerts"}
                className={`p-1.5 border transition ${
                  isMuted
                    ? "border-red-500/40 text-red-400 bg-red-500/10"
                    : "border-[#26313A] text-[#19C7F3] hover:bg-[#19C7F3]/10"
                }`}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              {/* CLEAR HISTORY BUTTON */}
              {visibleOrders.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Clear notification history"
                  className="flex items-center gap-1 p-1.5 border border-[#26313A] text-xs font-semibold text-[#707A82] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline text-[10px]">Clear</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#707A82] hover:text-[#F5F7F8]"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* POPUP BODY: TOP 5 ORDERS */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-[#1D252B]">
            {visibleOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle2 size={24} className="text-[#707A82] mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#F5F7F8]">No new order notifications</p>
                <p className="mt-1 text-[10px] text-[#707A82]">History is clear. New orders will pop up here.</p>
              </div>
            ) : (
              visibleOrders.map((order) => {
                const customerName =
                  typeof order.customer === "object"
                    ? order.customer?.fullname || "Customer"
                    : order.customer || "Customer";
                const serviceName =
                  typeof order.service === "object" ? order.service?.name : order.service || "Car Care Wash";

                return (
                  <Link
                    key={order.id}
                    href="/admin/bookings"
                    onClick={() => setIsOpen(false)}
                    className="group block p-3.5 transition hover:bg-[#080A0C]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#19C7F3] text-xs">
                            #{order.booking_number || `BW-${order.id}`}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <h4 className="mt-1 font-semibold text-[#F5F7F8] text-xs line-clamp-1 group-hover:text-[#19C7F3] transition">
                          {serviceName}
                        </h4>
                        <p className="text-[11px] text-[#707A82]">
                          {customerName} • ₹{order.total_amount || order.total_price || order.base_price}
                        </p>
                      </div>

                      <span className="flex items-center gap-1 shrink-0 text-[10px] text-[#707A82]">
                        <Clock size={10} />
                        {formatOrderTime(order.created_at)}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* POPUP FOOTER */}
          <div className="border-t border-[#26313A] bg-[#080A0C] p-2.5 text-center">
            <Link
              href="/admin/bookings"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#19C7F3] hover:underline"
            >
              View All Orders
              <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
