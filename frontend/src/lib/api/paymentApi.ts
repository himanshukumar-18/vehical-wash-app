import axiosInstance from "../axios";

export interface RazorpayOrder {
  payment_id?: string;
  razorpay_order_id: string;
  order_id?: string;
  amount: number;
  currency: string;
  razorpay_key: string;
  key?: string;
  booking_id?: string | number;
}

export interface PaymentVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id?: string | number;
}

export interface PaymentStatus {
  id?: string | number;
  booking_id: string | number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  provider_payment_id?: string;
  amount: number;
}

export const paymentApi = {
  createOrder: async (bookingId: string | number): Promise<RazorpayOrder> => {
    const res = await axiosInstance.post("payments/orders/razorpay/", {
      booking_id: bookingId,
    });
    const data = res.data;
    const razorpayKey = data.razorpay_key || data.key || "";
    const orderId = data.razorpay_order_id || data.order_id || "";

    return {
      payment_id: data.payment_id,
      razorpay_order_id: orderId,
      order_id: orderId,
      amount: data.amount,
      currency: data.currency || "INR",
      razorpay_key: razorpayKey,
      key: razorpayKey,
      booking_id: bookingId,
    };
  },

  verify: async (payload: PaymentVerifyPayload): Promise<{ success: boolean; message?: string }> => {
    const res = await axiosInstance.post("payments/verify/razorpay/", payload);
    return res.data;
  },

  getStatus: async (bookingId: string | number): Promise<PaymentStatus> => {
    const res = await axiosInstance.get(`payments/bookings/${bookingId}/`);
    return res.data;
  },

  requestRefund: async (
    paymentId: string,
    amount: number,
    reason?: string
  ): Promise<{ success: boolean; refund_id?: string }> => {
    const res = await axiosInstance.post("payments/refunds/", {
      payment_id: paymentId,
      amount,
      reason,
    });
    return res.data;
  },
};
