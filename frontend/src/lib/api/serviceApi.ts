import axiosInstance from "../axios";

export interface Service {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description: string;
  price: number | string;
  duration_minutes: number;
  image?: string | null;
  image_url?: string | null;
  is_active: boolean;
  is_featured?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServicePayload {
  name: string;
  short_description?: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active?: boolean;
  is_featured?: boolean;
  image?: File | null;
}

export const serviceApi = {
  getAll: async (): Promise<Service[]> => {
    const res = await axiosInstance.get("services/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  getBySlug: async (slug: string): Promise<Service> => {
    const res = await axiosInstance.get(`services/${slug}/`);
    return res.data;
  },

  create: async (payload: CreateServicePayload | FormData): Promise<Service> => {
    const isFormData = payload instanceof FormData;
    const res = await axiosInstance.post("services/", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data;
  },

  update: async (slug: string, payload: Partial<CreateServicePayload> | FormData): Promise<Service> => {
    const isFormData = payload instanceof FormData;
    const res = await axiosInstance.patch(`services/${slug}/`, payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data;
  },

  delete: async (slug: string): Promise<void> => {
    await axiosInstance.delete(`services/${slug}/`);
  },
};
