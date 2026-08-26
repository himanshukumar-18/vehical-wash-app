"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Trash2,
  Star,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { testimonialApi, Testimonial } from "@/lib/api/testimonialApi";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">("pending");
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await testimonialApi.getAdminAll();
      setTestimonials(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load customer testimonials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleApprove = async (id: number | string) => {
    setActionLoading(id);
    try {
      const updated = await testimonialApi.adminApprove(id);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t))
      );
    } catch (err: any) {
      alert("Failed to approve testimonial. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this testimonial? It will be permanently removed everywhere.")) {
      return;
    }
    setActionLoading(id);
    try {
      await testimonialApi.adminDelete(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert("Failed to delete testimonial. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingList = testimonials.filter((t) => !t.is_approved);
  const approvedList = testimonials.filter((t) => t.is_approved);

  const filteredTestimonials =
    activeTab === "pending"
      ? pendingList
      : activeTab === "approved"
      ? approvedList
      : testimonials;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#26313A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-[#19C7F3]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#19C7F3]">
              Review Moderation
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#F5F7F8] sm:text-3xl">
            Customer Testimonials
          </h1>
          <p className="mt-1 text-xs text-[#A7B0B7]">
            Review, approve, or delete customer feedback before it publishes to the website.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTestimonials}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 border border-[#26313A] bg-[#0D1115] px-4 text-xs font-bold text-[#F5F7F8] hover:border-[#19C7F3]/50 hover:text-[#19C7F3] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* TABS FILTER */}
      <div className="flex items-center gap-2 border-b border-[#26313A] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "pending"
              ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
              : "border-[#26313A] bg-[#0D1115] text-[#707A82] hover:text-[#F5F7F8]"
          }`}
        >
          <span>Pending Review</span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[10px] text-amber-400">
            {pendingList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("approved")}
          className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "approved"
              ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
              : "border-[#26313A] bg-[#0D1115] text-[#707A82] hover:text-[#F5F7F8]"
          }`}
        >
          <span>Approved & Published</span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500/20 px-1.5 text-[10px] text-emerald-400">
            {approvedList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "all"
              ? "border-[#19C7F3] bg-[#19C7F3]/10 text-[#19C7F3]"
              : "border-[#26313A] bg-[#0D1115] text-[#707A82] hover:text-[#F5F7F8]"
          }`}
        >
          <span>All Feedback</span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#19C7F3]/20 px-1.5 text-[10px] text-[#19C7F3]">
            {testimonials.length}
          </span>
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 animate-pulse border border-[#26313A] bg-[#0D1115]" />
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="border border-dashed border-[#26313A] bg-[#0D1115] p-12 text-center">
          <MessageSquare size={36} className="mx-auto text-[#707A82] mb-3 opacity-40" />
          <h3 className="font-bold text-sm text-[#F5F7F8]">No testimonials found</h3>
          <p className="mt-1 text-xs text-[#707A82]">
            {activeTab === "pending"
              ? "All submitted customer reviews have been moderated."
              : "No customer feedback matches the selected filter."}
          </p>
        </div>
      ) : (
        /* TESTIMONIAL CARDS GRID */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between border border-[#26313A] bg-[#0D1115] p-5 shadow-lg transition hover:border-[#26313A]/80"
            >
              <div>
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#26313A]">
                  <div>
                    <h3 className="font-bold text-sm text-[#F5F7F8]">
                      {item.customer_name}
                    </h3>
                    <p className="text-[11px] text-[#707A82]">
                      {item.customer_title || "Customer"}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {item.is_approved ? (
                    <span className="flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                      <CheckCircle2 size={10} /> Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400 shrink-0">
                      <Clock size={10} /> Pending
                    </span>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= item.rating
                          ? "fill-[#19C7F3] text-[#19C7F3]"
                          : "text-[#26313A]"
                      }
                    />
                  ))}
                  <span className="ml-1.5 text-[11px] font-bold text-[#19C7F3]">
                    {item.rating}.0 / 5.0
                  </span>
                </div>

                {/* Comment Text */}
                <p className="mt-3 text-xs text-[#A7B0B7] leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Footer Actions */}
              <div className="mt-5 pt-3 border-t border-[#1D252B] flex items-center justify-between gap-3">
                <span className="text-[10px] text-[#707A82]">
                  Submitted: {formatDate(item.created_at)}
                </span>

                <div className="flex items-center gap-2">
                  {/* Approve Button */}
                  {!item.is_approved && (
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id)}
                      disabled={actionLoading === item.id}
                      className="inline-flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500 hover:text-black disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      {actionLoading === item.id ? "Approving..." : "Approve"}
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoading === item.id}
                    className="inline-flex items-center gap-1 border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500 hover:text-black disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    {actionLoading === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
