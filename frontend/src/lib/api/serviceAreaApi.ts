import axiosInstance from "../axios";

export interface ServiceArea {
  id: number | string;
  name: string;
  city: string;
  description?: string;
  pincodes?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  radius_km: number | string;
  travel_charge: number | string;
  min_booking_amount: number | string;
  is_active: boolean;
  display_order: number;
  bookings_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const serviceAreaApi = {
  getAllPublic: async (): Promise<ServiceArea[]> => {
    const res = await axiosInstance.get("service-areas/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  getAdminAll: async (): Promise<ServiceArea[]> => {
    const res = await axiosInstance.get("admin/service-areas/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  create: async (payload: Partial<ServiceArea>): Promise<ServiceArea> => {
    const res = await axiosInstance.post("admin/service-areas/", payload);
    return res.data;
  },

  update: async (id: number | string, payload: Partial<ServiceArea>): Promise<ServiceArea> => {
    const res = await axiosInstance.put(`admin/service-areas/${id}/`, payload);
    return res.data;
  },

  toggleActive: async (id: number | string): Promise<{ success: boolean; data: ServiceArea }> => {
    const res = await axiosInstance.post(`admin/service-areas/${id}/toggle-active/`);
    return res.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(`admin/service-areas/${id}/`);
  },
};
