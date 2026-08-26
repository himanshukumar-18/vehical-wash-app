"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Power,
  Percent,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
} from "lucide-react";
import { offerApi, Offer } from "@/lib/api/offerApi";
import { serviceApi, Service } from "@/lib/api/serviceApi";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [minBookingAmount, setMinBookingAmount] = useState("0");
  const [firstBookingOnly, setFirstBookingOnly] = useState(false);
  const [usageLimit, setUsageLimit] = useState("");
  const [perCustomerUsageLimit, setPerCustomerUsageLimit] = useState("1");
  const [isActive, setIsActive] = useState(true);

  const fetchOffersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [offerData, serviceData] = await Promise.all([
        offerApi.getAdminAll(),
        serviceApi.getAll(),
      ]);
      setOffers(offerData);
      setServices(serviceData);
    } catch (err: any) {
      console.error("Failed to load offers:", err);
      setError(err?.message || "Failed to load offers management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersData();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    setName("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMaxDiscountAmount("");
    setMinBookingAmount("0");
    setFirstBookingOnly(false);
    setUsageLimit("");
    setPerCustomerUsageLimit("1");
    setIsActive(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (o: Offer) => {
    setEditingOffer(o);
    setName(o.name);
    setDescription(o.description || "");
    setDiscountType(o.discount_type);
    setDiscountValue(String(o.discount_value));
    setMaxDiscountAmount(o.max_discount_amount ? String(o.max_discount_amount) : "");
    setMinBookingAmount(String(o.min_booking_amount || 0));
    setFirstBookingOnly(o.first_booking_only);
    setUsageLimit(o.usage_limit ? String(o.usage_limit) : "");
    setPerCustomerUsageLimit(String(o.per_customer_usage_limit || 1));
    setIsActive(o.is_active);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const payload: Partial<Offer> = {
      name: name.trim(),
      description: description.trim(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      min_booking_amount: parseFloat(minBookingAmount) || 0,
      first_booking_only: firstBookingOnly,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      per_customer_usage_limit: parseInt(perCustomerUsageLimit) || 1,
      is_active: isActive,
    };

    try {
      if (editingOffer) {
        await offerApi.update(editingOffer.id, payload);
      } else {
        await offerApi.create(payload);
      }
      setIsModalOpen(false);
      await fetchOffersData();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to save offer.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (id: number | string) => {
    try {
      await offerApi.toggleActive(id);
      await fetchOffersData();
    } catch (err: any) {
      alert("Failed to toggle offer status.");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await offerApi.delete(id);
      await fetchOffersData();
    } catch (err: any) {
      alert("Failed to delete offer.");
    }
  };

  const filtered = offers.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.description && o.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#19C7F3]">
            Promotions & Discounts
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#F5F7F8] sm:text-4xl">
            Offers Management
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#A7B0B7]">
            Create and manage automatic discounts applied dynamically during doorstep car wash checkout.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchOffersData}
            className="inline-flex h-11 items-center justify-center gap-2 border border-[#26313A] bg-[#0D1115] px-5 text-xs font-bold text-[#A7B0B7] hover:text-[#19C7F3]"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 items-center justify-center gap-2 bg-[#19C7F3] px-5 text-xs font-bold text-[#050708] hover:bg-[#0FA9D1]"
          >
            <Plus size={16} /> Create Offer
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Total Offers</p>
          <p className="mt-2 text-[2rem] font-bold text-[#F5F7F8]">{offers.length}</p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Active Offers</p>
          <p className="mt-2 text-[2rem] font-bold text-emerald-400">
            {offers.filter((o) => o.is_active).length}
          </p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Total Redemptions</p>
          <p className="mt-2 text-[2rem] font-bold text-[#19C7F3]">
            {offers.reduce((acc, o) => acc + (o.total_usages_count || 0), 0)}
          </p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Total Savings Given</p>
          <p className="mt-2 text-[2rem] font-bold text-amber-400">
            ₹{offers.reduce((acc, o) => acc + (o.total_discount_given || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* OFFERS TABLE */}
      <div className="border border-[#26313A] bg-[#0D1115]">
        <div className="border-b border-[#26313A] p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#F5F7F8]">Promotional Offers</h2>
            <p className="text-xs text-[#707A82]">{filtered.length} offers configured</p>
          </div>
          <div className="relative w-full sm:w-[300px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A82]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search offers..."
              className="h-10 w-full border border-[#26313A] bg-[#080A0C] pl-10 pr-4 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#707A82] animate-pulse">Loading offers...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#707A82]">No offers found. Click Create Offer to start!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#26313A] bg-[#080A0C]">
                  {["Offer Title", "Discount", "Min Order", "First Booking Only", "Redemptions", "Discount Given", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[9px] font-bold uppercase tracking-wider text-[#707A82]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-[#1D252B] hover:bg-[#12171C]">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-[#F5F7F8]">{o.name}</div>
                      {o.description && <div className="text-[11px] text-[#707A82] truncate max-w-[220px]">{o.description}</div>}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#19C7F3]">
                      {o.discount_type === "percentage" ? `${o.discount_value}% OFF` : `₹${o.discount_value} OFF`}
                      {o.max_discount_amount ? <span className="block text-[10px] text-[#707A82]">Max ₹{o.max_discount_amount}</span> : null}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-[#A7B0B7]">
                      ₹{o.min_booking_amount || 0}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {o.first_booking_only ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-400/10 text-purple-400 border border-purple-400/20">Yes</span>
                      ) : (
                        <span className="text-[#707A82]">No</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#F5F7F8]">
                      {o.total_usages_count || 0} {o.usage_limit ? `/ ${o.usage_limit}` : ""}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-amber-400">
                      ₹{o.total_discount_given || 0}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(o.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase ${
                          o.is_active
                            ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                            : "bg-red-400/10 text-red-400 border border-red-400/20"
                        }`}
                      >
                        <Power size={11} /> {o.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(o)}
                          className="p-1.5 text-[#A7B0B7] hover:text-[#19C7F3]"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(o.id)}
                          className="p-1.5 text-[#707A82] hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-[3001] w-full max-w-[500px] border border-[#26313A] bg-[#0D1115] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#26313A]">
              <h3 className="font-bold text-lg text-[#F5F7F8]">
                {editingOffer ? "Edit Offer" : "Create New Offer"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#707A82] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. First Wash 10% OFF"
                  className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percentage" ? "10" : "150"}
                    className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                    Min Booking Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={minBookingAmount}
                    onChange={(e) => setMinBookingAmount(e.target.value)}
                    placeholder="0"
                    className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="Optional (e.g. 200)"
                    className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="firstBookingOnly"
                  checked={firstBookingOnly}
                  onChange={(e) => setFirstBookingOnly(e.target.checked)}
                  className="h-4 w-4 accent-[#19C7F3]"
                />
                <label htmlFor="firstBookingOnly" className="text-xs text-[#F5F7F8]">
                  First Booking Only (New Customers)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#19C7F3]"
                />
                <label htmlFor="isActive" className="text-xs text-[#F5F7F8]">
                  Activate Offer Immediately
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#1D252B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#707A82] hover:text-[#F5F7F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="h-10 bg-[#19C7F3] px-5 text-xs font-bold uppercase text-black hover:bg-[#0FA9D1] disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingOffer ? "Update Offer" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
