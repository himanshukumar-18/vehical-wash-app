"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Power,
  Navigation,
  IndianRupee,
  X,
  Building2,
} from "lucide-react";
import { serviceAreaApi, ServiceArea } from "@/lib/api/serviceAreaApi";

export default function AdminServiceAreasPage() {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [city, setCity] = useState("Hazaribagh");
  const [description, setDescription] = useState("");
  const [pincodes, setPincodes] = useState("");
  const [travelCharge, setTravelCharge] = useState("50");
  const [minBookingAmount, setMinBookingAmount] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const fetchServiceAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceAreaApi.getAdminAll();
      setServiceAreas(data);
    } catch (err: any) {
      console.error("Failed to load service areas:", err);
      setError(err?.message || "Failed to load service areas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  const openCreateModal = () => {
    setEditingArea(null);
    setName("");
    setCity("Hazaribagh");
    setDescription("");
    setPincodes("825301");
    setTravelCharge("50");
    setMinBookingAmount("0");
    setIsActive(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (area: ServiceArea) => {
    setEditingArea(area);
    setName(area.name);
    setCity(area.city || "Hazaribagh");
    setDescription(area.description || "");
    setPincodes(area.pincodes || "");
    setTravelCharge(String(area.travel_charge || 0));
    setMinBookingAmount(String(area.min_booking_amount || 0));
    setIsActive(area.is_active);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const payload: Partial<ServiceArea> = {
      name: name.trim(),
      city: city.trim(),
      description: description.trim(),
      pincodes: pincodes.trim(),
      travel_charge: parseFloat(travelCharge) || 0,
      min_booking_amount: parseFloat(minBookingAmount) || 0,
      is_active: isActive,
    };

    try {
      if (editingArea) {
        await serviceAreaApi.update(editingArea.id, payload);
      } else {
        await serviceAreaApi.create(payload);
      }
      setIsModalOpen(false);
      await fetchServiceAreas();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to save service area.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (id: number | string) => {
    try {
      await serviceAreaApi.toggleActive(id);
      await fetchServiceAreas();
    } catch (err: any) {
      alert("Failed to toggle area status.");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this service area?")) return;
    try {
      await serviceAreaApi.delete(id);
      await fetchServiceAreas();
    } catch (err: any) {
      alert("Failed to delete service area.");
    }
  };

  const filtered = serviceAreas.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      (a.pincodes && a.pincodes.includes(search))
  );

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#19C7F3]">
            Doorstep Coverage Zones
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#F5F7F8] sm:text-4xl">
            Service Areas
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#A7B0B7]">
            Define doorstep service coverage zones and dynamic travel charges applied per location.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchServiceAreas}
            className="inline-flex h-11 items-center justify-center gap-2 border border-[#26313A] bg-[#0D1115] px-5 text-xs font-bold text-[#A7B0B7] hover:text-[#19C7F3]"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 items-center justify-center gap-2 bg-[#19C7F3] px-5 text-xs font-bold text-[#050708] hover:bg-[#0FA9D1]"
          >
            <Plus size={16} /> Add Service Area
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Total Coverage Zones</p>
          <p className="mt-2 text-[2rem] font-bold text-[#F5F7F8]">{serviceAreas.length}</p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Active Zones</p>
          <p className="mt-2 text-[2rem] font-bold text-emerald-400">
            {serviceAreas.filter((a) => a.is_active).length}
          </p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Avg Travel Fee</p>
          <p className="mt-2 text-[2rem] font-bold text-[#19C7F3]">
            ₹
            {serviceAreas.length > 0
              ? Math.round(
                  serviceAreas.reduce((acc, a) => acc + (parseFloat(String(a.travel_charge)) || 0), 0) /
                    serviceAreas.length
                )
              : 0}
          </p>
        </div>
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Total Bookings Served</p>
          <p className="mt-2 text-[2rem] font-bold text-purple-400">
            {serviceAreas.reduce((acc, a) => acc + (a.bookings_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* SERVICE AREAS TABLE */}
      <div className="border border-[#26313A] bg-[#0D1115]">
        <div className="border-b border-[#26313A] p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#F5F7F8]">Coverage Zones</h2>
            <p className="text-xs text-[#707A82]">{filtered.length} service zones listed</p>
          </div>
          <div className="relative w-full sm:w-[300px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A82]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search area, city, pincode..."
              className="h-10 w-full border border-[#26313A] bg-[#080A0C] pl-10 pr-4 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#707A82] animate-pulse">Loading service areas...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#707A82]">No service areas found. Click Add Service Area!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#26313A] bg-[#080A0C]">
                  {["Area Name", "City", "Pincodes", "Travel Fee", "Bookings Served", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[9px] font-bold uppercase tracking-wider text-[#707A82]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-[#1D252B] hover:bg-[#12171C]">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-[#F5F7F8]">{a.name}</div>
                      {a.description && <div className="text-[11px] text-[#707A82] truncate max-w-[200px]">{a.description}</div>}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#A7B0B7]">{a.city}</td>
                    <td className="px-5 py-4 text-xs font-mono text-[#19C7F3]">
                      {a.pincodes || "All Pincodes"}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-emerald-400">
                      ₹{a.travel_charge}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#F5F7F8]">
                      {a.bookings_count || 0}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(a.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase ${
                          a.is_active
                            ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                            : "bg-red-400/10 text-red-400 border border-red-400/20"
                        }`}
                      >
                        <Power size={11} /> {a.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(a)}
                          className="p-1.5 text-[#A7B0B7] hover:text-[#19C7F3]"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
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
          <div className="relative z-[3001] w-full max-w-[480px] border border-[#26313A] bg-[#0D1115] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#26313A]">
              <h3 className="font-bold text-lg text-[#F5F7F8]">
                {editingArea ? "Edit Service Area" : "Add Service Area"}
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
                  Area Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hazaribagh Central, Matwari Zone"
                  className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Hazaribagh"
                    className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                    Travel Fee (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={travelCharge}
                    onChange={(e) => setTravelCharge(e.target.value)}
                    placeholder="50"
                    className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#707A82] mb-1">
                  Pincodes Served (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={pincodes}
                  onChange={(e) => setPincodes(e.target.value)}
                  placeholder="e.g. 825301, 825302"
                  className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#19C7F3]"
                />
                <label htmlFor="isActive" className="text-xs text-[#F5F7F8]">
                  Activate Service Area Immediately
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
                  {formLoading ? "Saving..." : editingArea ? "Update Area" : "Save Area"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
