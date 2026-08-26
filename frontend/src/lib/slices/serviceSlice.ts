import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { serviceApi, Service, CreateServicePayload } from "../api/serviceApi";
import { getErrorMessage } from "../axios";

interface ServiceState {
  services: Service[];
  selectedService: Service | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  selectedService: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  "service/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await serviceApi.getAll();
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createService = createAsyncThunk(
  "service/create",
  async (payload: CreateServicePayload | FormData, { rejectWithValue }) => {
    try {
      return await serviceApi.create(payload);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateService = createAsyncThunk(
  "service/update",
  async (
    { slug, payload }: { slug: string; payload: Partial<CreateServicePayload> | FormData },
    { rejectWithValue }
  ) => {
    try {
      return await serviceApi.update(slug, payload);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteService = createAsyncThunk(
  "service/delete",
  async (slug: string, { rejectWithValue }) => {
    try {
      await serviceApi.delete(slug);
      return slug;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    selectService(state, action: PayloadAction<Service>) {
      state.selectedService = action.payload;
    },
    clearServiceError(state) {
      state.error = null;
    },
    resetServices(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createService.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.creating = false;
        state.services.unshift(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateService.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.services.findIndex((s) => s.slug === action.payload.slug || s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteService.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.deleting = false;
        state.services = state.services.filter((s) => s.slug !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectService, clearServiceError, resetServices } = serviceSlice.actions;

export const selectServices = (state: { service: ServiceState }) => state.service.services;
export const selectSelectedService = (state: { service: ServiceState }) => state.service.selectedService;
export const selectServicesLoading = (state: { service: ServiceState }) => state.service.loading;
export const selectServiceError = (state: { service: ServiceState }) => state.service.error;

export default serviceSlice.reducer;
