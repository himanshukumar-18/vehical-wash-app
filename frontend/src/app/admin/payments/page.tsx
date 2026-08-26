"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Filter,
  IndianRupee,
  MoreHorizontal,
  ReceiptText,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import axiosInstance, { getErrorMessage } from "@/lib/axios";

type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";
type PaymentMethod = "UPI" | "Card" | "Cash" | "Razorpay";

type PaymentRecord = {
  id: string;
  bookingId: string;
  bookingPk: string | number;
  customer: string;
  email: string;
  service: string;
  vehicle: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  rawBooking?: any;
};

const statusStyles: Record<PaymentStatus, string> = {
  Paid: "border border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Pending: "border border-amber-400/20 bg-amber-400/10 text-amber-400",
  Failed: "border border-red-400/20 bg-red-400/10 text-red-400",
  Refunded: "border border-[#26313A] bg-[#12171C] text-[#707A82]",
};

const statusDotStyles: Record<PaymentStatus, string> = {
  Paid: "bg-emerald-400",
  Pending: "bg-amber-400",
  Failed: "bg-red-400",
  Refunded: "bg-[#707A82]",
};

const methodStyles: Record<PaymentMethod, string> = {
  UPI: "bg-[#19C7F3]/10 text-[#19C7F3]",
  Card: "bg-[#19C7F3]/10 text-[#19C7F3]",
  Cash: "bg-emerald-400/10 text-emerald-400",
  Razorpay: "bg-[#19C7F3]/10 text-[#19C7F3]",
};

export default function PaymentPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState<"All" | PaymentStatus>("All");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPaymentData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try dedicated payments admin list first
      let records: PaymentRecord[] = [];
      try {
        const res = await axiosInstance.get("payments/admin/");
        const rawList = Array.isArray(res.data) ? res.data : (res.data.results || []);
        records = rawList.map((p: any) => ({
          id: p.provider_payment_id || `PAY-${p.id.slice(0, 8)}`,
          bookingId: `#${p.booking_number || p.booking}`,
          bookingPk: p.booking,
          customer: p.customer_fullname || "Customer unavailable",
          email: p.customer_email || "",
          service: p.service_name || "Wash Service",
          vehicle: p.vehicle_info || "Vehicle",
          date: p.created_at ? p.created_at.split("T")[0] : "Today",
          amount: Number(p.amount || 0),
          method: p.provider === "cash" ? "Cash" : "Razorpay",
          status: p.status === "paid" ? "Paid" : p.status === "refunded" ? "Refunded" : p.status === "failed" ? "Failed" : "Pending",
        }));
      } catch {
        // Fallback to bookings list if payments admin endpoint not used
        const res = await axiosInstance.get("admin/bookings/");
        const bookingsList = Array.isArray(res.data) ? res.data : (res.data.results || []);
        records = bookingsList.map((b: any) => {
          const cust = typeof b.customer === "object" ? b.customer : null;
          const custName = cust?.fullname || cust?.name || cust?.email || (b.customer ? String(b.customer) : "Customer unavailable");
          const serv = typeof b.service === "object" ? b.service.name : String(b.service || "Car Wash");
          const veh = typeof b.vehicle === "object" ? `${b.vehicle.brand || ""} ${b.vehicle.model || ""}` : String(b.vehicle || "Vehicle");

          let pStatus: PaymentStatus = "Pending";
          if (b.payment_status === "paid") pStatus = "Paid";
          else if (b.payment_status === "failed") pStatus = "Failed";
          else if (b.payment_status === "refunded") pStatus = "Refunded";

          return {
            id: `PAY-${b.id}`,
            bookingId: `#${b.booking_number || b.id}`,
            bookingPk: b.id,
            customer: custName,
            email: cust?.email || "",
            service: serv,
            vehicle: veh,
            date: b.booking_date || (b.created_at ? b.created_at.split("T")[0] : "Today"),
            amount: Number(b.total_price || 0),
            method: b.payment_status === "paid" ? "Cash" : "Razorpay",
            status: pStatus,
            rawBooking: b,
          };
        });
      }

      setPayments(records);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const handleMarkPaid = async (bookingId: string | number) => {
    setActionLoading(`paid-${bookingId}`);
    try {
      await axiosInstance.post(`admin/bookings/${bookingId}/mark-paid/`);
      await fetchPaymentData();
      setSelectedPayment(null);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (bookingId: string | number) => {
    if (!confirm("Are you sure you want to process a refund for this booking?")) return;
    setActionLoading(`refund-${bookingId}`);
    try {
      await axiosInstance.post(`admin/bookings/${bookingId}/refund/`);
      await fetchPaymentData();
      setSelectedPayment(null);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return payments.filter((payment) => {
      const searchableText = `${payment.id} ${payment.bookingId} ${payment.customer} ${payment.email} ${payment.service}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus = activeStatus === "All" || payment.status === activeStatus;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, activeStatus]);

  const totalRevenue = useMemo(() => {
    return payments
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const paidCount = useMemo(() => payments.filter((p) => p.status === "Paid").length, [payments]);
  const pendingCount = useMemo(() => payments.filter((p) => p.status === "Pending").length, [payments]);

  const avgOrderValue = useMemo(() => {
    if (paidCount === 0) return 0;
    return Math.round(totalRevenue / paidCount);
  }, [totalRevenue, paidCount]);

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      helper: "From completed paid bookings",
      icon: IndianRupee,
      iconClass: "bg-[#19C7F3]/10 text-[#19C7F3]",
    },
    {
      label: "Successful Payments",
      value: paidCount,
      helper: "Payments settled",
      icon: CheckCircle2,
      iconClass: "bg-emerald-400/10 text-emerald-400",
    },
    {
      label: "Pending Payments",
      value: pendingCount,
      helper: "Awaiting confirmation",
      icon: Clock3,
      iconClass: "bg-amber-400/10 text-amber-400",
    },
    {
      label: "Average Order Value",
      value: `₹${avgOrderValue.toLocaleString("en-IN")}`,
      helper: "Per completed wash",
      icon: TrendingUp,
      iconClass: "bg-[#19C7F3]/10 text-[#19C7F3]",
    },
  ];

  return (
    <section className="space-y-7 sm:space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#19C7F3]">
            Payment Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#F5F7F8] sm:text-4xl">
            Payments & Revenue
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#A7B0B7]">
            Monitor backend transactions, payment statuses, and settlement details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchPaymentData()}
          className="inline-flex h-11 items-center justify-center gap-2 border border-[#26313A] bg-[#0D1115] px-5 text-xs font-bold uppercase tracking-[0.08em] text-[#A7B0B7] hover:text-[#19C7F3]"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#707A82]">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-[2rem] font-bold tracking-[-0.05em] text-[#F5F7F8]">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center ${stat.iconClass}`}>
                  <Icon size={15} />
                </span>
              </div>
              <p className="mt-4 text-[10px] text-[#707A82]">{stat.helper}</p>
            </article>
          );
        })}
      </div>

      {/* TRANSACTIONS PANEL */}
      <section className="border border-[#26313A] bg-[#0D1115]">
        <div className="border-b border-[#26313A] p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-[-0.03em] text-[#F5F7F8]">
                Transaction History
              </h2>
              <p className="mt-1 text-xs text-[#707A82]">
                {filteredPayments.length} transaction{filteredPayments.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="relative w-full xl:w-[300px]">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A82]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payment or customer..."
                className="h-10 w-full border border-[#26313A] bg-[#080A0C] pl-10 pr-4 text-sm text-[#F5F7F8] outline-none placeholder:text-[#707A82] focus:border-[#19C7F3]/50"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1">
            <Filter size={15} className="mr-1 shrink-0 text-[#707A82]" />
            {(["All", "Paid", "Pending", "Failed", "Refunded"] as const).map((status) => {
              const active = activeStatus === status;
              const count = status === "All" ? payments.length : payments.filter((p) => p.status === status).length;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveStatus(status)}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold transition-colors",
                    active
                      ? "bg-[#19C7F3] text-[#050708]"
                      : "border border-[#26313A] bg-[#080A0C] text-[#707A82] hover:text-[#F5F7F8]",
                  ].join(" ")}
                >
                  {status}
                  <span className={active ? "text-[#050708]/60" : "text-[#707A82]"}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="p-8 text-center space-y-3">
            <div className="h-6 w-32 bg-[#26313A] mx-auto animate-pulse rounded" />
            <div className="h-10 w-full max-w-md bg-[#26313A] mx-auto animate-pulse rounded" />
          </div>
        ) : error ? (
          <div className="p-8 text-center border-t border-[#26313A]">
            <XCircle size={32} className="mx-auto text-red-400 mb-2" />
            <p className="text-sm font-semibold text-red-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchPaymentData}
              className="inline-flex items-center gap-2 border border-[#19C7F3] px-4 py-2 text-xs font-bold text-[#19C7F3]"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-[#707A82]">
            <ReceiptText size={32} className="mx-auto mb-2 text-[#707A82]" />
            <p className="text-sm font-bold text-[#F5F7F8]">No transactions found</p>
            <p className="text-xs mt-1">No payment records match your search or filter.</p>
          </div>
        ) : (
          /* TABLE */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#26313A] bg-[#080A0C]">
                  {["Payment ID", "Booking", "Customer", "Service", "Date", "Method", "Amount", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.14em] text-[#707A82]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-[#26313A] last:border-0 hover:bg-[#12171C]">
                    <td className="px-5 py-4 text-xs font-bold text-[#F5F7F8]">{payment.id}</td>
                    <td className="px-5 py-4 text-xs font-mono text-[#19C7F3]">{payment.bookingId}</td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-[#F5F7F8]">{payment.customer}</p>
                      {payment.email && <p className="text-[10px] text-[#707A82]">{payment.email}</p>}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#A7B0B7]">{payment.service}</td>
                    <td className="px-5 py-4 text-xs text-[#A7B0B7]">{payment.date}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold ${methodStyles[payment.method]}`}>
                        <CreditCard size={12} /> {payment.method}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#F5F7F8]">₹{payment.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold ${statusStyles[payment.status]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[payment.status]}`} />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPayment(payment)}
                        className="px-3 py-1 text-xs font-bold text-[#19C7F3] border border-[#19C7F3]/40 hover:bg-[#19C7F3]/10"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* PAYMENT DETAIL MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#26313A] bg-[#0D1115] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#26313A] pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#19C7F3]">Transaction Detail</span>
                <h3 className="text-base font-bold text-[#F5F7F8]">{selectedPayment.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="text-[#707A82] hover:text-[#F5F7F8]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#A7B0B7]">
              <div className="flex justify-between py-1 border-b border-[#26313A]/50">
                <span>Booking Ref:</span>
                <span className="font-bold text-[#19C7F3]">{selectedPayment.bookingId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#26313A]/50">
                <span>Customer:</span>
                <span className="font-semibold text-[#F5F7F8]">{selectedPayment.customer}</span>
              </div>
              {selectedPayment.email && (
                <div className="flex justify-between py-1 border-b border-[#26313A]/50">
                  <span>Email:</span>
                  <span>{selectedPayment.email}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#26313A]/50">
                <span>Service:</span>
                <span className="font-semibold text-[#F5F7F8]">{selectedPayment.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#26313A]/50">
                <span>Vehicle:</span>
                <span>{selectedPayment.vehicle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#26313A]/50">
                <span>Total Amount:</span>
                <span className="font-bold text-base text-[#F5F7F8]">₹{selectedPayment.amount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#26313A]/50">
                <span>Payment Status:</span>
                <span className={`px-2 py-0.5 font-bold ${statusStyles[selectedPayment.status]}`}>
                  {selectedPayment.status}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#26313A]">
              {selectedPayment.status === "Pending" && (
                <button
                  type="button"
                  onClick={() => handleMarkPaid(selectedPayment.bookingPk)}
                  className="bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400"
                >
                  Mark Cash Paid
                </button>
              )}
              {selectedPayment.status === "Paid" && (
                <button
                  type="button"
                  onClick={() => handleRefund(selectedPayment.bookingPk)}
                  className="bg-red-500/20 text-red-400 border border-red-500/40 px-4 py-2 text-xs font-bold hover:bg-red-500/30"
                >
                  Refund Payment
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="border border-[#26313A] px-4 py-2 text-xs font-bold text-[#A7B0B7] hover:text-[#F5F7F8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}