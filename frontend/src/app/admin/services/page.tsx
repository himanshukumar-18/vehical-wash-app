"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import {
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Filter,
  Grid2X2,
  Image as ImageIcon,
  List,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { AppDispatch } from "@/lib/store";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  selectServices,
  selectServicesLoading,
  selectServiceError,
} from "@/lib/slices/serviceSlice";
import { Service as BackendService } from "@/lib/api/serviceApi";

export default function AdminServicesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const services = useSelector(selectServices);
  const loading = useSelector(selectServicesLoading);
  const error = useSelector(selectServiceError);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BackendService | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("45");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const filtered = useMemo(
    () =>
      services.filter((s) => {
        const query = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          (s.short_description && s.short_description.toLowerCase().includes(query))
        );
      }),
    [services, search]
  );

  const openCreateModal = () => {
    setEditingService(null);
    setName("");
    setDescription("");
    setShortDescription("");
    setPrice("");
    setDuration("45");
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (service: BackendService) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setShortDescription(service.short_description || "");
    setPrice(String(service.price));
    setDuration(String(service.duration_minutes));
    setIsActive(service.is_active);
    setImageFile(null);
    setImagePreview(service.image_url || null);
    setModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !duration || !description) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("short_description", shortDescription);
      formData.append("price", price);
      formData.append("duration_minutes", duration);
      formData.append("is_active", String(isActive));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingService) {
        const identifier = editingService.slug || String(editingService.id);
        await dispatch(updateService({ slug: identifier, payload: formData })).unwrap();
      } else {
        await dispatch(createService(formData as any)).unwrap();
      }
      setModalOpen(false);
      dispatch(fetchServices());
    } catch (err) {
      console.error("Failed to save service:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: BackendService) => {
    try {
      const identifier = service.slug || String(service.id);
      await dispatch(
        updateService({
          slug: identifier,
          payload: { is_active: !service.is_active },
        })
      ).unwrap();
      dispatch(fetchServices());
    } catch (err) {
      console.error("Failed to toggle service status:", err);
    }
  };

  const handleDelete = async (service: BackendService) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return;
    try {
      const identifier = service.slug || String(service.id);
      await dispatch(deleteService(identifier)).unwrap();
      dispatch(fetchServices());
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  const totalServices = services.length;
  const activeCount = services.filter((s) => s.is_active).length;

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#19C7F3]">
            Service Management
          </p>
          <h1 className="mt-2 font-bold tracking-[-0.04em] text-[#F5F7F8] text-3xl sm:text-4xl">
            Services
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#A7B0B7]">
            Create, update, and control the vehicle-care packages available for your customers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="group inline-flex h-11 w-fit items-center gap-2 bg-[#19C7F3] px-5 text-xs font-bold uppercase tracking-[0.08em] text-[#050708] transition hover:bg-[#0FA9D1] active:scale-[0.98]"
        >
          <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
          Add New Service
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">
              Total Services
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#19C7F3]/10 text-[#19C7F3]">
              <Wrench size={15} strokeWidth={1.8} />
            </span>
          </div>
          <p className="font-bold tracking-[-0.05em] text-[#F5F7F8] text-[2rem]">{totalServices}</p>
          <p className="mt-2 text-[10px] text-[#707A82]">Configured packages</p>
        </div>

        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">
              Active Services
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#19C7F3]/10 text-[#19C7F3]">
              <CheckCircle2 size={15} strokeWidth={1.8} />
            </span>
          </div>
          <p className="font-bold tracking-[-0.05em] text-[#F5F7F8] text-[2rem]">{activeCount}</p>
          <p className="mt-2 text-[10px] text-[#707A82]">Available for booking</p>
        </div>

        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">
              Backend Sync
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#19C7F3]/10 text-[#19C7F3]">
              <Sparkles size={15} strokeWidth={1.8} />
            </span>
          </div>
          <p className="font-bold tracking-[-0.05em] text-[#F5F7F8] text-[2rem]">Live</p>
          <p className="mt-2 text-[10px] text-[#707A82]">Real-time API source of truth</p>
        </div>
      </div>

      {/* SERVICE PANEL */}
      <div className="border border-[#26313A] bg-[#0D1115]">
        {/* Toolbar */}
        <div className="border-b border-[#26313A] p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-bold tracking-[-0.03em] text-[#F5F7F8] text-lg">
                Service Catalogue
              </h2>
              <p className="mt-0.5 text-xs text-[#707A82]">
                {filtered.length} service{filtered.length !== 1 ? "s" : ""} available
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[260px]">
                <Search size={14} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A82]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services..."
                  className="h-10 w-full border border-[#26313A] bg-[#080A0C] pl-10 pr-4 text-sm text-[#F5F7F8] outline-none placeholder:text-[#707A82] focus:border-[#19C7F3]/50"
                />
              </div>

              <div className="flex border border-[#26313A] bg-[#080A0C]">
                {(["grid", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={[
                      "flex h-10 w-10 items-center justify-center transition",
                      viewMode === mode ? "bg-[#19C7F3]/10 text-[#19C7F3]" : "text-[#707A82] hover:text-[#F5F7F8]",
                    ].join(" ")}
                  >
                    {mode === "grid" ? <Grid2X2 size={15} /> : <List size={15} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="p-8 text-center text-sm text-[#707A82] animate-pulse">Loading service catalogue...</div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-red-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => dispatch(fetchServices())}
              className="inline-flex items-center gap-2 border border-[#19C7F3] px-4 py-2 text-xs font-bold text-[#19C7F3]"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <Search size={20} className="text-[#707A82]" />
            <p className="font-bold text-[#F5F7F8] text-base">No services found</p>
            <p className="text-xs text-[#707A82]">Create a new service or adjust search term.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filtered.map((service) => (
              <article key={service.id} className="border border-[#26313A] bg-[#080A0C] flex flex-col justify-between overflow-hidden">
                {service.image_url ? (
                  <div className="relative h-40 w-full bg-[#050708]">
                    <Image
                      src={service.image_url}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-[#050708] text-xs text-[#707A82] border-b border-[#26313A]">
                    <ImageIcon className="h-5 w-5 mr-1.5 opacity-50" /> No image set
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#19C7F3] bg-[#19C7F3]/10 px-2 py-1">
                        {service.duration_minutes} Mins
                      </span>
                      <span className={`text-xs font-semibold ${service.is_active ? "text-emerald-400" : "text-[#707A82]"}`}>
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <h3 className="mt-3 font-bold text-[#F5F7F8] text-lg">{service.name}</h3>
                    <p className="mt-2 text-xs text-[#707A82] line-clamp-3">{service.description}</p>
                  </div>

                  <div className="border-t border-[#26313A] pt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#19C7F3]">₹{service.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(service)}
                        className={`text-xs px-2.5 py-1 font-semibold border ${service.is_active ? "border-amber-500/40 text-amber-400" : "border-emerald-500/40 text-emerald-400"}`}
                      >
                        {service.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="p-1.5 border border-[#26313A] text-[#A7B0B7] hover:text-[#19C7F3]"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(service)}
                        className="p-1.5 border border-[#26313A] text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[#1D252B]">
            {filtered.map((service) => (
              <div key={service.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {service.image_url ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-[#26313A]">
                      <Image src={service.image_url} alt={service.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#080A0C] text-[#707A82] border border-[#26313A]">
                      <ImageIcon size={18} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-[#F5F7F8]">{service.name}</h3>
                    <p className="text-xs text-[#707A82]">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#19C7F3]">₹{service.price}</span>
                  <button type="button" onClick={() => openEditModal(service)} className="text-xs text-[#19C7F3]">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md border border-[#26313A] bg-[#0D1115] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#26313A] pb-4 mb-4">
              <h3 className="font-bold text-lg text-[#F5F7F8]">
                {editingService ? "Edit Service" : "Create New Service"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-[#707A82] hover:text-[#F5F7F8]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#707A82] uppercase mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  placeholder="e.g. Deluxe Foam Wash"
                />
              </div>

              {/* Service Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#707A82] uppercase mb-1">Service Image (Cloudinary)</label>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative h-32 w-full overflow-hidden rounded border border-[#26313A] bg-[#050708]">
                      <Image src={imagePreview} alt="Service preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="flex w-full items-center justify-center gap-2 border border-dashed border-[#19C7F3]/50 bg-[#19C7F3]/5 py-2 text-xs font-bold text-[#19C7F3] cursor-pointer hover:bg-[#19C7F3]/10 transition">
                    <Upload size={14} />
                    <span>{imagePreview ? "Change Service Image" : "Upload Service Image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#707A82] uppercase mb-1">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full h-10 border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  placeholder="e.g. Exterior care and foam wash"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#707A82] uppercase mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#26313A] bg-[#080A0C] p-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                  placeholder="Detailed service description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#707A82] uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-10 border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                    placeholder="799"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#707A82] uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-10 border border-[#26313A] bg-[#080A0C] px-3 text-sm text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                    placeholder="45"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#19C7F3]"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-[#F5F7F8]">
                  Active for customer booking
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#26313A]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#707A82] hover:text-[#F5F7F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#19C7F3] px-5 py-2 text-xs font-bold text-black hover:bg-[#0FA9D1] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingService ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}