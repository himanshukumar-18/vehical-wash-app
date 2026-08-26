import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { vehicleApi, Vehicle, VehiclePayload } from "../api/vehicleApi";
import { getErrorMessage } from "../axios";

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  selectedVehicle: null,
  loading: false,
  creating: false,
  error: null,
};

export const fetchVehicles = createAsyncThunk(
  "vehicle/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await vehicleApi.getAll();
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createVehicle = createAsyncThunk(
  "vehicle/create",
  async (payload: VehiclePayload, { rejectWithValue }) => {
    try {
      return await vehicleApi.create(payload);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "vehicle/delete",
  async (id: string | number, { rejectWithValue }) => {
    try {
      await vehicleApi.delete(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    selectVehicle(state, action: PayloadAction<Vehicle>) {
      state.selectedVehicle = action.payload;
    },
    clearVehicleError(state) {
      state.error = null;
    },
    resetVehicles(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
        if (!state.selectedVehicle && action.payload.length > 0) {
          state.selectedVehicle = action.payload.find((v) => v.is_default) || action.payload[0];
        }
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createVehicle.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.creating = false;
        state.vehicles.unshift(action.payload);
        state.selectedVehicle = action.payload;
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter((v) => String(v.id) !== String(action.payload));
        if (state.selectedVehicle && String(state.selectedVehicle.id) === String(action.payload)) {
          state.selectedVehicle = state.vehicles[0] || null;
        }
      });
  },
});

export const { selectVehicle, clearVehicleError, resetVehicles } = vehicleSlice.actions;

export const selectVehicles = (state: { vehicle: VehicleState }) => state.vehicle.vehicles;
export const selectSelectedVehicle = (state: { vehicle: VehicleState }) => state.vehicle.selectedVehicle;
export const selectVehiclesLoading = (state: { vehicle: VehicleState }) => state.vehicle.loading;
export const selectVehicleCreating = (state: { vehicle: VehicleState }) => state.vehicle.creating;
export const selectVehicleError = (state: { vehicle: VehicleState }) => state.vehicle.error;

export default vehicleSlice.reducer;
