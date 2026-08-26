"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Quote, Star, Plus, CheckCircle2, X, AlertCircle } from "lucide-react";
import { testimonialApi, Testimonial } from "@/lib/api/testimonialApi";

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: "f1",
    customer_name: "Rahul Verma",
    customer_title: "Honda City Owner • Hazaribagh",
    rating: 5,
    comment: "The Black Wash mobile van team arrived right on time at my doorstep. High pressure foam wash and interior vacuuming were top quality. Truly hassle-free!",
    is_approved: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f2",
    customer_name: "Priya Sharma",
    customer_title: "Hyundai Creta Owner • Matwari",
    rating: 5,
    comment: "Exceptional detailing service! My SUV paint shine looks like it just rolled out of the showroom. Very professional staff and transparent pricing.",
    is_approved: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f3",
    customer_name: "Vikram Singh",
    customer_title: "Toyota Fortuner Owner • Korrah",
    rating: 5,
    comment: "Best car care experience in Hazaribagh. Water supply and equipment are completely managed by their mobile van. I will definitely book monthly!",
    is_approved: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchApprovedReviews = async () => {
    try {
      const data = await testimonialApi.getAllApproved();
      if (Array.isArray(data) && data.length > 0) {
        setTestimonials(data);
      } else {
        setTestimonials(FALLBACK_TESTIMONIALS);
      }
    } catch {
      setTestimonials(FALLBACK_TESTIMONIALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) {
      setErrorMessage("Please enter your name and review comments.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await testimonialApi.submit({
        customer_name: formName.trim(),
        customer_title: formTitle.trim() || "Vehicle Owner",
        rating: formRating,
        comment: formComment.trim(),
      });

      setSuccessMessage(
        "Thank you for your review! Your feedback has been submitted to admin for approval."
      );
      setFormName("");
      setFormTitle("");
      setFormComment("");
      setFormRating(5);

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="testimonials"
      className="relative w-full overflow-hidden bg-[#050708] py-20 text-[#F5F7F8] sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="h-px w-8 bg-[#19C7F3]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#19C7F3]">
                Customer Experience
              </span>
            </div>
            <h2 className="font-heading text-3xl font-bold uppercase tracking-[-0.04em] text-[#F5F7F8] sm:text-4xl lg:text-5xl">
              What Drivers Say
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 border border-[#19C7F3] bg-[#19C7F3]/10 px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#19C7F3] transition hover:bg-[#19C7F3] hover:text-black"
          >
            <Plus size={16} /> Share Your Feedback
          </button>
        </div>

        {/* TESTIMONIAL CARDS GRID */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex flex-col justify-between border border-[#26313A] bg-[#0D1115] p-6 transition hover:border-[#19C7F3]/40"
            >
              <div>
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between pb-4 border-b border-[#26313A]">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={
                          star <= item.rating
                            ? "fill-[#19C7F3] text-[#19C7F3]"
                            : "text-[#26313A]"
                        }
                      />
                    ))}
                  </div>
                  <Quote size={20} className="text-[#19C7F3]/40" />
                </div>

                {/* Comment Text */}
                <p className="mt-4 text-xs sm:text-sm text-[#A7B0B7] leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-4 border-t border-[#1D252B] flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#19C7F3]/10 text-[#19C7F3] font-bold text-xs border border-[#19C7F3]/30">
                  {item.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#F5F7F8]">
                    {item.customer_name}
                  </h4>
                  <p className="text-[10px] text-[#707A82] truncate max-w-[200px]">
                    {item.customer_title || "Verified Customer"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SUBMIT FEEDBACK MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-[2001] w-full max-w-[480px] border border-[#26313A] bg-[#0D1115] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#26313A]">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#19C7F3]" />
                  <h3 className="font-bold text-base text-[#F5F7F8]">
                    Share Your Feedback
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#707A82] hover:text-[#F5F7F8]"
                >
                  <X size={18} />
                </button>
              </div>

              {successMessage ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
                  <p className="font-bold text-sm text-[#F5F7F8]">{successMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="mt-4 space-y-4">
                  {errorMessage && (
                    <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                      <AlertCircle size={15} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1.5">
                      Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="p-1 transition hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={
                              star <= formRating
                                ? "fill-[#19C7F3] text-[#19C7F3]"
                                : "text-[#26313A]"
                            }
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-[#19C7F3]">
                        {formRating} Star{formRating > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                    />
                  </div>

                  {/* Vehicle Title / City */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
                      Vehicle Model or City (Optional)
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Honda City Owner • Hazaribagh"
                      className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
                    />
                  </div>

                  {/* Review Comments */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
                      Your Review & Feedback *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder="Tell us about your wash experience, van arrival, shine quality..."
                      className="w-full border border-[#26313A] bg-[#080A0C] p-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-[#707A82] hover:text-[#F5F7F8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="h-10 bg-[#19C7F3] px-6 text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:bg-[#0FA9D1] disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
