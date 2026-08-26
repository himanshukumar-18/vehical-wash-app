import axiosInstance from "../axios";

export interface Offer {
  id: number | string;
  name: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number | string;
  max_discount_amount?: number | string | null;
  min_booking_amount?: number | string;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  applicable_services?: number[];
  applicable_service_areas?: number[];
  first_booking_only: boolean;
  usage_limit?: number | null;
  per_customer_usage_limit: number;
  display_order: number;
  total_usages_count?: number;
  total_discount_given?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OfferUsage {
  id: number | string;
  offer: number | string;
  offer_name: string;
  user: number | string;
  user_email: string;
  booking: number | string;
  booking_number: string;
  discount_amount: number;
  used_at: string;
}

export const offerApi = {
  getAllPublic: async (): Promise<Offer[]> => {
    const res = await axiosInstance.get("offers/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  getAdminAll: async (): Promise<Offer[]> => {
    const res = await axiosInstance.get("admin/offers/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  create: async (payload: Partial<Offer>): Promise<Offer> => {
    const res = await axiosInstance.post("admin/offers/", payload);
    return res.data;
  },

  update: async (id: number | string, payload: Partial<Offer>): Promise<Offer> => {
    const res = await axiosInstance.put(`admin/offers/${id}/`, payload);
    return res.data;
  },

  toggleActive: async (id: number | string): Promise<{ success: boolean; data: Offer }> => {
    const res = await axiosInstance.post(`admin/offers/${id}/toggle-active/`);
    return res.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(`admin/offers/${id}/`);
  },

  getUsages: async (id: number | string): Promise<OfferUsage[]> => {
    const res = await axiosInstance.get(`admin/offers/${id}/usages/`);
    return res.data;
  },
};
