"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  KeyRound,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  XCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import { bookingApi, Booking } from "@/lib/api/bookingApi";

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-[#19C7F3]/10 text-[#19C7F3] border border-[#19C7F3]/20",
  pending: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20",
  in_progress: "bg-purple-400/10 text-purple-400 border border-purple-400/20",
  completed: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
  cancelled: "bg-red-400/10 text-red-400 border border-red-400/20",
};

const STATUS_TABS = ["All", "pending", "confirmed", "in_progress", "completed", "cancelled"] as const;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);

  // OTP Completion Modal state
  const [completeBookingTarget, setCompleteBookingTarget] = useState<Booking | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpModalError, setOtpModalError] = useState("");
  const [otpModalLoading, setOtpModalLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resentOtpCode, setResentOtpCode] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getAdminAll();
      setBookings(data);
    } catch (err: any) {
      console.error("Failed to load admin bookings:", err);
      setError(err?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const customerName = typeof b.customer === "object" ? b.customer?.fullname || "" : String(b.customer || "");
      const customerEmail = typeof b.customer === "object" ? b.customer?.email || "" : "";
      const serviceName = typeof b.service === "object" ? b.service?.name || "" : String(b.service || "");
      const addressStr = String(b.address || "");
      const matchSearch =
        !q ||
        b.booking_number.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        customerEmail.toLowerCase().includes(q) ||
        serviceName.toLowerCase().includes(q) ||
        addressStr.toLowerCase().includes(q);
      const matchTab = activeTab === "All" || b.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [bookings, search, activeTab]);

  const count = (tab: (typeof STATUS_TABS)[number]) =>
    tab === "All" ? bookings.length : bookings.filter((b) => b.status === tab).length;

  const handleConfirm = async (id: string | number) => {
    setActionLoading(`confirm-${id}`);
    try {
      await bookingApi.adminConfirm(id);
      await fetchBookings();
    } catch (err: any) {
      alert(err?.message || "Booking could not be confirmed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenCompleteModal = (target: Booking) => {
    setCompleteBookingTarget(target);
    setOtpInput(target.arrival_otp || "");
    setOtpModalError("");
    setResendSuccess("");
    setResentOtpCode("");
  };

  const handleCloseCompleteModal = () => {
    setCompleteBookingTarget(null);
    setOtpInput("");
    setOtpModalError("");
    setResendSuccess("");
    setResentOtpCode("");
  };

  const handleSubmitCompleteWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeBookingTarget) return;

    if (!otpInput.trim()) {
      setOtpModalError("Please enter the 4-digit arrival OTP provided by the customer.");
      return;
    }

    setOtpModalLoading(true);
    setOtpModalError("");

    try {
      await bookingApi.adminComplete(completeBookingTarget.id, otpInput.trim());
      handleCloseCompleteModal();
      await fetchBookings();
    } catch (err: any) {
      setOtpModalError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "Invalid arrival OTP code. Verification failed."
      );
    } finally {
      setOtpModalLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!completeBookingTarget) return;
    setResendLoading(true);
    setResendSuccess("");
    setOtpModalError("");
    setResentOtpCode("");
    try {
      const res = await bookingApi.adminResendOtp(completeBookingTarget.id);
      setResendSuccess(res.message || "Arrival OTP sent to customer successfully.");
      if (res.arrival_otp) {
        setResentOtpCode(res.arrival_otp);
        setOtpInput(res.arrival_otp);
      }
    } catch (err: any) {
      setOtpModalError(err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to resend arrival OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#19C7F3]">
            Mobile Van Booking Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#F5F7F8] sm:text-4xl">
            Bookings
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#A7B0B7]">
            Confirm and complete customer mobile car wash bookings and doorstep service requests.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="inline-flex h-11 items-center justify-center gap-2 border border-[#26313A] bg-[#0D1115] px-5 text-xs font-bold text-[#A7B0B7] hover:text-[#19C7F3]"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Total Bookings</p>
          <p className="mt-2 text-[2rem] font-bold text-[#F5F7F8]">{bookings.length}</p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Pending Confirmation</p>
          <p className="mt-2 text-[2rem] font-bold text-yellow-400">{count("pending")}</p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Confirmed</p>
          <p className="mt-2 text-[2rem] font-bold text-[#19C7F3]">{count("confirmed")}</p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Completed</p>
          <p className="mt-2 text-[2rem] font-bold text-emerald-400">{count("completed")}</p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="border border-[#26313A] bg-[#0D1115]">
        {/* Toolbar */}
        <div className="border-b border-[#26313A] p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-[-0.03em] text-[#F5F7F8]">All Mobile Wash Requests</h2>
              <p className="mt-0.5 text-xs text-[#707A82]">{filtered.length} bookings displayed</p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:w-[320px]">
                <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A82]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer, email, ID, service..."
                  className="h-11 w-full border border-[#26313A] bg-[#080A0C] pl-10 pr-4 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]/50"
                />
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-5 flex gap-1.5 overflow-x-auto pb-0.5">
            {STATUS_TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold transition-all",
                    active ? "bg-[#19C7F3] text-[#050708]" : "border border-[#26313A] bg-[#080A0C] text-[#707A82]",
                  ].join(" ")}
                >
                  {tab.toUpperCase()}
                  <span className={active ? "text-[#050708]/60" : "text-[#707A82]"}>{count(tab)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-[#707A82] animate-pulse">Loading bookings...</div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-sm text-red-400">{error}</p>
            <button type="button" onClick={fetchBookings} className="border border-[#19C7F3] px-4 py-2 text-xs font-bold text-[#19C7F3]">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#707A82]">No bookings match search filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#26313A] bg-[#080A0C]">
                  {["Booking", "Customer", "Contact Mobile", "Service", "Date & Location", "Price", "Payment", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[9px] font-bold uppercase tracking-wider text-[#707A82]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const rawName = typeof b.customer === "object" && b.customer ? b.customer.fullname : String(b.customer || "");
                  const customerName = rawName && isNaN(Number(rawName.trim())) ? rawName.trim() : "Customer";
                  const customerEmail = typeof b.customer === "object" && b.customer ? b.customer.email : "";
                  const serviceName = typeof b.service === "object" ? b.service?.name : String(b.service || "Service");
                  const prefDate = b.booking_date || (b.slot && typeof b.slot === "object" ? b.slot.date : null) || b.created_at?.split("T")[0] || "—";
                  const isConfirming = actionLoading === `confirm-${b.id}`;

                  const phoneMatch = b.address ? b.address.match(/(?:Ph:\s*|Phone:\s*|Contact:\s*)?([6-9]\d{9})/) : null;
                  const phoneVal = b.customer_phone || (phoneMatch ? phoneMatch[1] : (typeof b.customer === "object" && (b.customer as any).phone_number ? (b.customer as any).phone_number : null));

                  return (
                    <tr key={b.id} className="border-b border-[#1D252B] hover:bg-[#12171C]">
                      <td className="px-5 py-4 text-sm font-bold text-[#F5F7F8]">#{b.booking_number}</td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-[#F5F7F8]">{customerName}</p>
                        {customerEmail && <p className="text-[10px] text-[#707A82]">{customerEmail}</p>}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-[#A7B0B7]">
                        {phoneVal ? (
                          <a
                            href={`tel:${phoneVal}`}
                            className="inline-flex items-center gap-1.5 font-bold text-[#19C7F3] hover:underline"
                            title="Click to call customer"
                          >
                            <Phone size={13} /> {phoneVal}
                          </a>
                        ) : (
                          <span className="text-[#707A82]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#A7B0B7]">{serviceName}</td>
                      <td className="px-5 py-4 text-xs text-[#A7B0B7]">
                        <div className="font-bold text-[#F5F7F8]">{prefDate}</div>
                        <div className="mt-0.5 max-w-[220px] truncate text-[11px] text-[#19C7F3]">{b.address || "Doorstep Location"}</div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#F5F7F8]">₹{b.total_price}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-[#A7B0B7]">{b.payment_status?.toUpperCase()}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_BADGE[b.status] || ""}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {b.status === "pending" ? (
                          <button
                            type="button"
                            disabled={isConfirming}
                            onClick={() => handleConfirm(b.id)}
                            className="bg-[#19C7F3] px-3.5 py-1.5 text-xs font-bold text-[#050708] hover:bg-[#0FA9D1] disabled:opacity-50"
                          >
                            {isConfirming ? "Confirming..." : "Confirm"}
                          </button>
                        ) : b.status === "confirmed" || b.status === "in_progress" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCompleteModal(b)}
                            className="inline-flex items-center gap-1 bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-[#050708] hover:bg-emerald-500 disabled:opacity-50"
                          >
                            <ShieldCheck size={13} /> Complete
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#707A82]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ARRIVAL OTP VERIFICATION MODAL */}
      {completeBookingTarget && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div
            onClick={handleCloseCompleteModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative z-[3001] w-full max-w-[460px] border border-[#26313A] bg-[#0D1115] p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#26313A]">
              <div className="flex items-center gap-2.5">
                <KeyRound size={20} className="text-[#19C7F3]" />
                <div>
                  <h3 className="font-bold text-base text-[#F5F7F8]">
                    Verify Customer Arrival OTP
                  </h3>
                  <p className="text-[11px] text-[#707A82]">
                    Booking #{completeBookingTarget.booking_number}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCompleteModal}
                className="text-[#707A82] hover:text-[#F5F7F8]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmitCompleteWithOtp} className="mt-4 space-y-4">
              <div className="rounded border border-[#19C7F3]/30 bg-[#19C7F3]/10 p-3 text-xs text-[#19C7F3]">
                <p className="font-bold">Doorstep Service Verification Required</p>
                <p className="mt-1 text-[11px] text-[#A7B0B7]">
                  Please enter the Arrival OTP provided by the customer at the doorstep to verify service completion.
                </p>
              </div>

              {/* Resend OTP Action Box */}
              <div className="flex items-center justify-between border border-[#26313A] bg-[#080A0C] p-3 text-xs">
                <div>
                  <p className="font-bold text-[#F5F7F8]">Customer missing OTP?</p>
                  <p className="text-[10px] text-[#707A82]">Generate & resend code to customer</p>
                </div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-1.5 border border-[#19C7F3]/40 bg-[#19C7F3]/10 px-3 py-1.5 text-xs font-bold text-[#19C7F3] hover:bg-[#19C7F3] hover:text-black transition disabled:opacity-50 shrink-0"
                >
                  <Send size={12} /> {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              </div>

              {otpModalError && (
                <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-semibold">
                  <AlertCircle size={15} />
                  <span>{otpModalError}</span>
                </div>
              )}

              {resendSuccess && (
                <div className="flex flex-col gap-1 border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    <span>{resendSuccess}</span>
                  </div>
                  {resentOtpCode && (
                    <p className="text-[11px] text-[#A7B0B7] mt-1">
                      Generated Code: <span className="font-mono text-[#19C7F3] font-bold text-sm bg-black px-2 py-0.5 border border-[#19C7F3]/40">{resentOtpCode}</span>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1.5">
                  Customer Arrival OTP Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter OTP (e.g. 4829)"
                  className="h-11 w-full tracking-[0.2em] font-mono text-center text-lg font-bold border border-[#26313A] bg-[#080A0C] px-3 text-[#19C7F3] outline-none focus:border-[#19C7F3]"
                  autoFocus
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-[#1D252B]">
                <button
                  type="button"
                  onClick={handleCloseCompleteModal}
                  className="px-4 py-2 text-xs font-bold text-[#707A82] hover:text-[#F5F7F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpModalLoading || !otpInput.trim()}
                  className="h-10 bg-emerald-400 px-5 text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {otpModalLoading ? "Verifying..." : "Verify & Complete Wash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}