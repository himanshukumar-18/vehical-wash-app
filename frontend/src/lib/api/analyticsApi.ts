import axiosInstance from "../axios";

export interface AnalyticsOverview {
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  total_revenue: number;
  total_discounts: number;
  average_booking_value: number;
  growth: {
    revenue_percent: number | null;
    bookings_percent: number | null;
  };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
  discounts: number;
  avg_value: number;
}

export interface ServiceStat {
  service_id: number | string;
  service_name: string;
  bookings_count: number;
  completed_count: number;
  revenue: number;
  share_percentage: number;
}

export interface CustomerStats {
  total_customers: number;
  new_customers: number;
  active_customers: number;
  returning_customers: number;
  repeat_customer_rate: number;
}

export interface OfferStat {
  offer_id: number | string;
  offer_name: string;
  usage_count: number;
  total_discount_given: number;
  revenue_generated: number;
}

export interface OffersAnalytics {
  active_offers_count: number;
  total_discount_given: number;
  top_offers: OfferStat[];
}

export interface ServiceAreaStat {
  service_area_id: number | string;
  area_name: string;
  bookings_count: number;
  revenue: number;
  travel_charges_collected: number;
}

export const analyticsApi = {
  getOverview: async (period: string = "30days"): Promise<AnalyticsOverview> => {
    const res = await axiosInstance.get(`admin/analytics/overview/?period=${period}`);
    return res.data.data || res.data;
  },

  getRevenue: async (period: string = "30days"): Promise<RevenueDataPoint[]> => {
    const res = await axiosInstance.get(`admin/analytics/revenue/?period=${period}`);
    return res.data.data || res.data;
  },

  getServices: async (period: string = "30days"): Promise<ServiceStat[]> => {
    const res = await axiosInstance.get(`admin/analytics/services/?period=${period}`);
    return res.data.data || res.data;
  },

  getCustomers: async (period: string = "30days"): Promise<CustomerStats> => {
    const res = await axiosInstance.get(`admin/analytics/customers/?period=${period}`);
    return res.data.data || res.data;
  },

  getOffers: async (period: string = "30days"): Promise<OffersAnalytics> => {
    const res = await axiosInstance.get(`admin/analytics/offers/?period=${period}`);
    return res.data.data || res.data;
  },

  getServiceAreas: async (period: string = "30days"): Promise<ServiceAreaStat[]> => {
    const res = await axiosInstance.get(`admin/analytics/service-areas/?period=${period}`);
    return res.data.data || res.data;
  },
};
