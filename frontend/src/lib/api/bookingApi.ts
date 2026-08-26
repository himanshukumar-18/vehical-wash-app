import axiosInstance from "../axios";

export interface CreateBookingPayload {
  vehicle_id: string | number;
  service_id: string | number;
  booking_date: string;
  address: string;
  slot_id?: string | number;
  customer_note?: string;
  discount_percentage?: number;
  notes?: string;
  coupon_code?: string;
  payment_method?: string;
}

export interface PriceSummary {
  base_price: number;
  tax: number;
  discount: number;
  total_price: number;
  total_amount?: number;
  coupon_valid?: boolean;
}

export interface Booking {
  id: string | number;
  booking_id?: string | number;
  booking_number: string;
  booking_date?: string;
  customer?: string | { id: number; fullname: string; email: string };
  customer_phone?: string;
  vehicle: any;
  service: any;
  slot: any;
  address?: string;
  customer_note?: string;
  notes?: string;
  coupon_code?: string;
  payment_method?: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  base_price: number | string;
  travel_charge?: number | string;
  offer_name_snapshot?: string;
  arrival_otp?: string;
  tax: number | string;
  discount: number | string;
  total_price: number | string;
  total_amount?: number | string;
  created_at: string;
  updated_at?: string;
}

export interface DashboardMetrics {
  total_bookings: number;
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  revenue: number | string;
}

export const bookingApi = {
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const res = await axiosInstance.post("bookings/", payload);
    return res.data;
  },

  getAll: async (status?: string): Promise<Booking[]> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const res = await axiosInstance.get("bookings/", { params });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  getById: async (id: string | number): Promise<Booking> => {
    const res = await axiosInstance.get(`bookings/${id}/`);
    return res.data;
  },

  cancel: async (id: string | number, reason?: string): Promise<Booking> => {
    const res = await axiosInstance.post(`bookings/${id}/cancel/`, { reason });
    return res.data;
  },

  calculatePrice: async ({
    service_id,
    service_price,
    coupon_code,
  }: {
    service_id: string | number;
    service_price?: number;
    coupon_code?: string;
  }): Promise<PriceSummary> => {
    let base = typeof service_price === "number" && !isNaN(service_price) && service_price > 0 ? service_price : 0;

    if (base <= 0 && service_id) {
      try {
        const res = await axiosInstance.get(`services/${service_id}/`);
        if (res.data && res.data.price !== undefined) {
          base = parseFloat(String(res.data.price));
        }
      } catch (err) {
        console.error("Error fetching service price from DRF backend:", err);
      }
    }

    const tax = 0;
    const discount = coupon_code ? Math.min(100, base) : 0;
    const total = Math.max(0, Math.round((base - discount) * 100) / 100);

    return {
      base_price: base,
      tax,
      discount,
      total_price: total,
      total_amount: total,
      coupon_valid: Boolean(coupon_code && coupon_code.trim().length > 0),
    };
  },

  // Admin APIs
  getAdminAll: async (params?: { status?: string; payment_status?: string }): Promise<Booking[]> => {
    const res = await axiosInstance.get("admin/bookings/", { params });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  getDashboard: async (): Promise<DashboardMetrics> => {
    const res = await axiosInstance.get("admin/bookings/dashboard/");
    return res.data;
  },

  adminConfirm: async (id: string | number): Promise<Booking> => {
    const res = await axiosInstance.post(`admin/bookings/${id}/confirm/`);
    return res.data;
  },

  adminStart: async (id: string | number): Promise<Booking> => {
    const res = await axiosInstance.post(`admin/bookings/${id}/start/`);
    return res.data;
  },

  adminComplete: async (id: string | number, otp?: string): Promise<Booking> => {
    const res = await axiosInstance.post(`admin/bookings/${id}/complete/`, { otp });
    return res.data;
  },

  adminResendOtp: async (id: string | number): Promise<{ success: boolean; message: string; arrival_otp?: string }> => {
    const res = await axiosInstance.post(`admin/bookings/${id}/resend-otp/`);
    return res.data;
  },

  adminCancel: async (id: string | number, reason?: string): Promise<Booking> => {
    const res = await axiosInstance.post(`admin/bookings/${id}/cancel/`, { reason });
    return res.data;
  },

  adminMarkPaid: async (id: string | number): Promise<Booking> => {
    const res = await axiosInstance.post(`admin/bookings/${id}/mark-paid/`);
    return res.data;
  },
};
