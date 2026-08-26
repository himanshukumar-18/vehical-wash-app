"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  Filter,
  Grid2X2,
  List,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Star,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { customerApi, CustomerProfile, CustomerDetail } from "@/lib/api/customerApi";
import { getErrorMessage } from "@/lib/axios";

type CustomerStatus = "Active" | "Inactive" | "VIP";
type ViewMode = "grid" | "list";

const STATUS_TABS = ["All", "Active", "VIP", "Inactive"] as const;

const STATUS_STYLES: Record<CustomerStatus, string> = {
  Active: "border border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  VIP: "border border-[#19C7F3]/20 bg-[#19C7F3]/10 text-[#19C7F3]",
  Inactive: "border border-[#26313A] bg-[#12171C] text-[#707A82]",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<(typeof STATUS_TABS)[number]>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Delete modal state
  const [deleteModalCustomer, setDeleteModalCustomer] = useState<CustomerProfile | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleOpenDetail = async (id: string | number) => {
    setSelectedCustomerId(id);
    setDetailLoading(true);
    try {
      const detail = await customerApi.getDetail(id);
      setCustomerDetail(detail);
    } catch (err: any) {
      console.error("Failed to load customer detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteModalCustomer || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      await customerApi.deleteCustomer(deleteModalCustomer.id);
      setDeleteModalCustomer(null);
      setDeleteConfirmText("");
      setSelectedCustomerId(null);
      setCustomerDetail(null);
      await fetchCustomerData();
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const searchableText = `${customer.id} ${customer.name} ${customer.fullname} ${customer.email} ${customer.phone}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus = activeStatus === "All" || customer.status === activeStatus;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, activeStatus]);

  const totalBookingsCount = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
  }, [customers]);

  const stats = [
    {
      label: "Total Customers",
      value: customers.length,
      helper: "Registered accounts",
      icon: Users,
    },
    {
      label: "Active Accounts",
      value: customers.filter((c) => c.status === "Active").length,
      helper: "Verified & active",
      icon: UserCheck,
    },
    {
      label: "VIP Clients",
      value: customers.filter((c) => c.status === "VIP").length,
      helper: "High value clients",
      icon: Star,
    },
    {
      label: "Total Appointments",
      value: totalBookingsCount,
      helper: "Across all registered users",
      icon: CalendarDays,
    },
  ];

  const getStatusCount = (status: (typeof STATUS_TABS)[number]) => {
    if (status === "All") return customers.length;
    return customers.filter((c) => c.status === status).length;
  };

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#19C7F3]">
            Customer Directory
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#F5F7F8] sm:text-4xl">
            Customers
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#A7B0B7]">
            Real registered customer accounts, service histories, vehicles, and spending analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCustomerData}
          className="inline-flex h-11 items-center justify-center gap-2 border border-[#26313A] bg-[#0D1115] px-5 text-xs font-bold uppercase tracking-[0.08em] text-[#A7B0B7] hover:text-[#19C7F3]"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Directory
        </button>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map(({ label, value, helper, icon: Icon }) => (
          <article key={label} className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">
                {label}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#19C7F3]/10 text-[#19C7F3]">
                <Icon size={15} />
              </span>
            </div>
            <p className="text-[2rem] font-bold tracking-[-0.05em] text-[#F5F7F8]">{loading ? "..." : value}</p>
            <p className="mt-2 text-[10px] text-[#707A82]">{helper}</p>
          </article>
        ))}
      </div>

      {/* CUSTOMER PANEL */}
      <section className="border border-[#26313A] bg-[#0D1115]">
        <div className="border-b border-[#26313A] p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-[-0.03em] text-[#F5F7F8]">
                Registered Customer Accounts
              </h2>
              <p className="mt-0.5 text-xs text-[#707A82]">
                {filteredCustomers.length} user{filteredCustomers.length !== 1 ? "s" : ""} displayed
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full sm:w-[280px]">
                <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A82]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="h-10 w-full border border-[#26313A] bg-[#080A0C] pl-10 pr-4 text-sm text-[#F5F7F8] outline-none placeholder:text-[#707A82] focus:border-[#19C7F3]/50"
                />
              </div>

              <div className="flex border border-[#26313A] bg-[#080A0C]">
                {(["grid", "list"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`flex h-10 w-10 items-center justify-center ${viewMode === mode ? "bg-[#19C7F3]/10 text-[#19C7F3]" : "text-[#707A82] hover:text-[#F5F7F8]"}`}
                  >
                    {mode === "grid" ? <Grid2X2 size={15} /> : <List size={15} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <Filter size={13} className="shrink-0 text-[#707A82]" />
            {STATUS_TABS.map((status) => {
              const active = activeStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveStatus(status)}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold",
                    active
                      ? "bg-[#19C7F3] text-[#050708]"
                      : "border border-[#26313A] bg-[#080A0C] text-[#707A82] hover:text-[#F5F7F8]",
                  ].join(" ")}
                >
                  {status}
                  <span className={active ? "text-[#050708]/60" : "text-[#707A82]"}>
                    {getStatusCount(status)}
                  </span>
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
              onClick={fetchCustomerData}
              className="inline-flex items-center gap-2 border border-[#19C7F3] px-4 py-2 text-xs font-bold text-[#19C7F3]"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-[#707A82]">
            <Users size={32} className="mx-auto mb-2 text-[#707A82]" />
            <p className="text-sm font-bold text-[#F5F7F8]">No customer records found</p>
            <p className="text-xs mt-1">No registered user profiles match your search criteria.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <article
                key={customer.id}
                className="group relative flex flex-col justify-between border border-[#26313A] bg-[#080A0C] p-5 transition-colors hover:border-[#19C7F3]/30 hover:bg-[#0D1115]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#19C7F3]/10 text-xs font-bold text-[#19C7F3]">
                        {customer.initials}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-[#F5F7F8]">{customer.fullname || customer.name}</h3>
                        <p className="text-[10px] text-[#707A82]">Role: {customer.role || "customer"}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLES[customer.status]}`}>
                      {customer.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-[#A7B0B7]">
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-[#707A82]" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.created_at && (
                      <div className="flex items-center gap-2 text-[11px] text-[#707A82]">
                        <CalendarDays size={13} />
                        <span>Joined {customer.created_at}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[#26313A] pt-4 text-center">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#707A82]">Bookings</span>
                      <p className="text-sm font-bold text-[#F5F7F8]">{customer.totalBookings}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#707A82]">Total Spent</span>
                      <p className="text-sm font-bold text-[#19C7F3]">₹{customer.totalSpent}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(customer.id)}
                    className="h-9 flex-1 border border-[#26313A] bg-[#0D1115] text-xs font-bold text-[#19C7F3] hover:bg-[#19C7F3]/10"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalCustomer(customer);
                      setDeleteConfirmText("");
                    }}
                    className="h-9 w-9 flex shrink-0 items-center justify-center border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/20"
                    title="Emergency Delete Customer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[#26313A]">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-[#12171C]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-[#19C7F3]/10 text-xs font-bold text-[#19C7F3]">
                    {customer.initials}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F7F8]">{customer.fullname || customer.name}</h4>
                    <p className="text-[10px] text-[#707A82]">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#F5F7F8]">{customer.totalBookings} Bookings</p>
                    <p className="text-[10px] text-[#19C7F3]">₹{customer.totalSpent}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(customer.id)}
                    className="px-3 py-1.5 text-xs font-bold text-[#19C7F3] border border-[#19C7F3]/40"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalCustomer(customer);
                      setDeleteConfirmText("");
                    }}
                    className="p-1.5 text-red-400 border border-red-500/30 hover:bg-red-500/10"
                    title="Delete Account"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#26313A] bg-[#0D1115] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#26313A] pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#19C7F3]">Customer Detail</span>
                <h3 className="text-lg font-bold text-[#F5F7F8]">
                  {customerDetail?.profile.fullname || customerDetail?.profile.name || `User #${selectedCustomerId}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomerId(null);
                  setCustomerDetail(null);
                }}
                className="text-[#707A82] hover:text-[#F5F7F8]"
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center text-xs text-[#707A82] animate-pulse">Loading customer profile...</div>
            ) : customerDetail ? (
              <div className="space-y-6 text-xs text-[#A7B0B7]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080A0C] p-4 border border-[#26313A] text-center">
                  <div>
                    <span className="text-[9px] uppercase text-[#707A82]">Total Bookings</span>
                    <p className="text-base font-bold text-[#F5F7F8]">{customerDetail.profile.totalBookings}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#707A82]">Completed</span>
                    <p className="text-base font-bold text-emerald-400">{customerDetail.profile.completedBookings}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#707A82]">Cancelled</span>
                    <p className="text-base font-bold text-red-400">{customerDetail.profile.cancelledBookings}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#707A82]">Total Spent</span>
                    <p className="text-base font-bold text-[#19C7F3]">₹{customerDetail.profile.totalSpent}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#F5F7F8] mb-2">Registered Vehicles</h4>
                  {customerDetail.vehicles.length === 0 ? (
                    <p className="text-[#707A82]">No vehicles registered yet.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {customerDetail.vehicles.map((v) => (
                        <div key={v.id} className="p-3 border border-[#26313A] bg-[#080A0C]">
                          <p className="font-bold text-[#F5F7F8]">{v.brand} {v.model}</p>
                          <p className="font-mono text-[10px] text-[#19C7F3] uppercase">{v.registration_number}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#F5F7F8] mb-2">Booking History</h4>
                  {customerDetail.bookings.length === 0 ? (
                    <p className="text-[#707A82]">No booking history available.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {customerDetail.bookings.map((b) => (
                        <div key={b.id} className="flex justify-between items-center p-3 border border-[#26313A] bg-[#080A0C]">
                          <div>
                            <p className="font-bold text-[#F5F7F8]">#{b.booking_number || b.id}</p>
                            <p className="text-[10px] text-[#707A82]">{b.booking_date} • ₹{b.total_price}</p>
                          </div>
                          <span className="font-bold uppercase text-[9px] text-[#19C7F3] px-2 py-0.5 bg-[#19C7F3]/10 border border-[#19C7F3]/30">
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#26313A] flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalCustomer(customerDetail.profile);
                      setDeleteConfirmText("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} /> Emergency Delete Account
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* EMERGENCY DELETE CONFIRMATION MODAL */}
      {deleteModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-red-500/40 bg-[#0D1115] p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold text-[#F5F7F8]">Delete Customer Account?</h3>
            </div>

            <p className="text-xs leading-relaxed text-[#A7B0B7]">
              This will permanently delete the customer account for{" "}
              <strong className="text-[#F5F7F8]">{deleteModalCustomer.fullname || deleteModalCustomer.email}</strong>.
              Associated personal records will be removed. Financial and payment history will remain safely preserved for audit.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#707A82]">
                Type <span className="text-red-400 font-mono">DELETE</span> to confirm permanent deletion:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-10 border border-[#26313A] bg-[#080A0C] px-3 font-mono text-sm text-[#F5F7F8] outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#26313A]">
              <button
                type="button"
                onClick={() => setDeleteModalCustomer(null)}
                className="px-4 py-2 text-xs font-bold text-[#707A82] hover:text-[#F5F7F8]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE" || deleting}
                onClick={handleDeleteCustomer}
                className="bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}