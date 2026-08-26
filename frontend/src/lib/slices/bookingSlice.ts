import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { bookingApi, Booking, CreateBookingPayload, PriceSummary } from "../api/bookingApi";
import { getErrorMessage } from "../axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BookingTab = "upcoming" | "completed" | "cancelled" | "refunded";

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  priceSummary: PriceSummary | null;
  activeTab: BookingTab;
  loading: boolean;
  creating: boolean;
  cancelling: boolean;
  priceLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  priceSummary: null,
  activeTab: "upcoming",
  loading: false,
  creating: false,
  cancelling: false,
  priceLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Helper — safely extract array from any API response shape
// ---------------------------------------------------------------------------

const toArray = (data: unknown): Booking[] => {
  if (Array.isArray(data)) return data;

  // DRF pagination: { count, results: [...] }
  if (data && typeof data === "object" && Array.isArray((data as any).results)) {
    return (data as any).results;
  }

  console.error("Unexpected API response shape, expected array:", data);
  return [];
};

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchMyBookings = createAsyncThunk(
  "booking/fetchAll",
  async (status: string | undefined, { rejectWithValue }) => {
    try {
      const data = await bookingApi.getAll(status);
      return toArray(data); // always returns Booking[]
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load bookings";
      return rejectWithValue(msg);
    }
  }
);

export const createBooking = createAsyncThunk(
  "booking/create",
  async (payload: CreateBookingPayload, { rejectWithValue }) => {
    try {
      return await bookingApi.create(payload);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancel",
  async (id: string, { rejectWithValue }) => {
    try {
      await bookingApi.cancel(id);
      return id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel booking";
      return rejectWithValue(msg);
    }
  }
);

export const calculatePrice = createAsyncThunk(
  "booking/calculatePrice",
  async (
    { service_id, service_price, coupon_code }: { service_id: string | number; service_price?: number; coupon_code?: string },
    { rejectWithValue }
  ) => {
    try {
      return await bookingApi.calculatePrice({ service_id, service_price, coupon_code });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to calculate price";
      return rejectWithValue(msg);
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<BookingTab>) {
      state.activeTab = action.payload;
    },
    setCurrentBooking(state, action: PayloadAction<Booking | null>) {
      state.currentBooking = action.payload;
    },
    clearBookingError(state) {
      state.error = null;
    },
    resetBookingState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder

      // fetchMyBookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload; // always an array via toArray()
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.bookings = []; // reset to array so .filter() never breaks
        state.error = action.payload as string;
      })

      // createBooking
      .addCase(createBooking.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creating = false;
        state.currentBooking = action.payload;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })

      // cancelBooking
      .addCase(cancelBooking.pending, (state) => {
        state.cancelling = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelling = false;
        // use String() comparison to avoid number vs string mismatch on id
        const booking = state.bookings.find(
          (b) => String(b.id) === String(action.payload)
        );
        if (booking) booking.status = "cancelled";
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelling = false;
        state.error = action.payload as string;
      })

      // calculatePrice
      .addCase(calculatePrice.pending, (state) => {
        state.priceLoading = true;
        state.error = null;
      })
      .addCase(calculatePrice.fulfilled, (state, action) => {
        state.priceLoading = false;
        state.priceSummary = action.payload;
      })
      .addCase(calculatePrice.rejected, (state, action) => {
        state.priceLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveTab,
  setCurrentBooking,
  clearBookingError,
  resetBookingState,
} = bookingSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectBookings = (state: { booking: BookingState }) =>
  state.booking.bookings;

export const selectCurrentBooking = (state: { booking: BookingState }) =>
  state.booking.currentBooking;

export const selectPriceSummary = (state: { booking: BookingState }) =>
  state.booking.priceSummary;

export const selectBookingLoading = (state: { booking: BookingState }) =>
  state.booking.loading;

export const selectBookingCreating = (state: { booking: BookingState }) =>
  state.booking.creating;

export const selectBookingCancelling = (state: { booking: BookingState }) =>
  state.booking.cancelling;

export const selectBookingError = (state: { booking: BookingState }) =>
  state.booking.error;

export const selectActiveTab = (state: { booking: BookingState }) =>
  state.booking.activeTab;

export const selectPriceLoading = (state: { booking: BookingState }) =>
  state.booking.priceLoading;

export default bookingSlice.reducer;