import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { paymentApi, RazorpayOrder, PaymentVerifyPayload, PaymentStatus } from "../api/paymentApi";
import { getErrorMessage } from "../axios";

interface PaymentState {
  razorpayOrder: RazorpayOrder | null;
  paymentStatus: PaymentStatus | null;
  loading: boolean;
  verifying: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  razorpayOrder: null,
  paymentStatus: null,
  loading: false,
  verifying: false,
  error: null,
};

export const createPaymentOrder = createAsyncThunk(
  "payment/createOrder",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      return await paymentApi.createOrder(bookingId);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async (payload: PaymentVerifyPayload, { rejectWithValue }) => {
    try {
      return await paymentApi.verify(payload);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  "payment/fetchStatus",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      return await paymentApi.getStatus(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get payment status";
      return rejectWithValue(msg);
    }
  }
);

export const requestRefund = createAsyncThunk(
  "payment/refund",
  async (
    { bookingId, reason }: { bookingId: string; reason: string },
    { rejectWithValue }
  ) => {
    try {
      return await paymentApi.requestRefund(bookingId, 0, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Refund request failed";
      return rejectWithValue(msg);
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError(state) {
      state.error = null;
    },
    resetPayment(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.verifying = false;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifying = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.paymentStatus = action.payload;
      });
  },
});

export const { clearPaymentError, resetPayment } = paymentSlice.actions;

// Selectors
export const selectRazorpayOrder = (state: { payment: PaymentState }) =>
  state.payment.razorpayOrder;
export const selectPaymentStatus = (state: { payment: PaymentState }) =>
  state.payment.paymentStatus;
export const selectPaymentLoading = (state: { payment: PaymentState }) =>
  state.payment.loading;
export const selectPaymentVerifying = (state: { payment: PaymentState }) =>
  state.payment.verifying;
export const selectPaymentError = (state: { payment: PaymentState }) =>
  state.payment.error;

export default paymentSlice.reducer;
