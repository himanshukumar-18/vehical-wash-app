import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import vehicleReducer from "./slices/vehicleSlice";
import serviceReducer from "./slices/serviceSlice";
import bookingReducer from "./slices/bookingSlice";
import paymentReducer from "./slices/paymentSlice";
import imageReducer from "./slices/imageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicle: vehicleReducer,
    service: serviceReducer,
    booking: bookingReducer,
    payment: paymentReducer,
    images: imageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;