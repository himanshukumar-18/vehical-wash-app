import axiosInstance from "../axios";

export interface Testimonial {
  id: number | string;
  customer_name: string;
  customer_title: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SubmitTestimonialPayload {
  customer_name: string;
  customer_title?: string;
  rating: number;
  comment: string;
}

export const testimonialApi = {
  // Public API: Get approved testimonials
  getAllApproved: async (): Promise<Testimonial[]> => {
    const res = await axiosInstance.get("testimonials/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  // Public API: Submit new customer feedback
  submit: async (payload: SubmitTestimonialPayload): Promise<{ success: boolean; message: string }> => {
    const res = await axiosInstance.post("testimonials/", payload);
    return res.data;
  },

  // Admin API: Get all testimonials (pending + approved)
  getAdminAll: async (): Promise<Testimonial[]> => {
    const res = await axiosInstance.get("admin/testimonials/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  // Admin API: Approve testimonial
  adminApprove: async (id: number | string): Promise<Testimonial> => {
    const res = await axiosInstance.post(`admin/testimonials/${id}/approve/`);
    return res.data;
  },

  // Admin API: Delete testimonial
  adminDelete: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(`admin/testimonials/${id}/`);
  },
};
