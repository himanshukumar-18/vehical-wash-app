import axiosInstance from "../axios";

export interface CustomerProfile {
  id: string | number;
  fullname: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  location?: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  status: "Active" | "Inactive" | "VIP";
  initials: string;
  created_at?: string;
}

export interface CustomerDetail {
  profile: CustomerProfile;
  bookings: any[];
  vehicles: any[];
}

export const customerApi = {
  getAll: async (role?: string, search?: string): Promise<CustomerProfile[]> => {
    const params: Record<string, string> = {};
    if (role && role !== "All") params.role = role;
    if (search) params.search = search;

    const res = await axiosInstance.get("auth/admin/users/", { params });
    const rawData = res.data;
    return Array.isArray(rawData) ? rawData : (rawData.results || []);
  },

  getDetail: async (customerId: string | number): Promise<CustomerDetail> => {
    const res = await axiosInstance.get(`auth/admin/users/${customerId}/`);
    return res.data;
  },

  deleteCustomer: async (customerId: string | number): Promise<{ success: boolean; message: string }> => {
    const res = await axiosInstance.delete(`auth/admin/users/${customerId}/`);
    return res.data;
  },
};
