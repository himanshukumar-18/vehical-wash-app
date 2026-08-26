import axiosInstance from "../axios";

export type VehicleType = "hatchback" | "sedan" | "suv" | "muv" | "luxury";

export interface VehiclePayload {
  name?: string;
  brand: string;
  model: string;
  registration_number: string;
  vehicle_type: VehicleType;
  color?: string;
  is_default?: boolean;
}

export interface Vehicle {
  id: string | number;
  owner?: number;
  owner_name?: string;
  name?: string;
  brand: string;
  model: string;
  registration_number: string;
  vehicle_type: VehicleType;
  vehicle_type_display?: string;
  color?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const res = await axiosInstance.get("vehicles/");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  getById: async (id: string | number): Promise<Vehicle> => {
    const res = await axiosInstance.get(`vehicles/${id}/`);
    return res.data;
  },

  create: async (payload: VehiclePayload): Promise<Vehicle> => {
    const res = await axiosInstance.post("vehicles/", payload);
    return res.data;
  },

  update: async (id: string | number, payload: Partial<VehiclePayload>): Promise<Vehicle> => {
    const res = await axiosInstance.patch(`vehicles/${id}/`, payload);
    return res.data;
  },

  delete: async (id: string | number): Promise<void> => {
    await axiosInstance.delete(`vehicles/${id}/`);
  },
};
