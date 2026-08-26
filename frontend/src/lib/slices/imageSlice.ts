import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { imageApi, DynamicImageItem } from "../api/imageApi";

interface ImageState {
  publicImages: Record<string, DynamicImageItem>;
  adminImages: DynamicImageItem[];
  loading: boolean;
  uploadingKey: string | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: ImageState = {
  publicImages: {},
  adminImages: [],
  loading: false,
  uploadingKey: null,
  error: null,
  successMessage: null,
};

export const fetchPublicImages = createAsyncThunk(
  "images/fetchPublicImages",
  async (_, { rejectWithValue }) => {
    try {
      return await imageApi.getPublicImages();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load public images");
    }
  }
);

export const fetchAdminImages = createAsyncThunk(
  "images/fetchAdminImages",
  async (_, { rejectWithValue }) => {
    try {
      return await imageApi.getAdminImages();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load admin image inventory");
    }
  }
);

export const uploadAdminImage = createAsyncThunk(
  "images/uploadAdminImage",
  async (
    { key, file, variant }: { key: string; file: File; variant?: "desktop" | "mobile" },
    { rejectWithValue }
  ) => {
    try {
      return await imageApi.uploadImage(key, file, variant || "desktop");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || `Failed to upload image for ${key}`);
    }
  }
);

export const updateAdminImage = createAsyncThunk(
  "images/updateAdminImage",
  async (
    { key, data }: { key: string; data: Partial<DynamicImageItem> },
    { rejectWithValue }
  ) => {
    try {
      return await imageApi.updateImage(key, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || `Failed to update image slot ${key}`);
    }
  }
);

export const resetAdminImage = createAsyncThunk(
  "images/resetAdminImage",
  async (key: string, { rejectWithValue }) => {
    try {
      return await imageApi.resetImage(key);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || `Failed to reset image slot ${key}`);
    }
  }
);

export const removeAdminImage = createAsyncThunk(
  "images/removeAdminImage",
  async (key: string, { rejectWithValue }) => {
    try {
      return await imageApi.removeImage(key);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || `Failed to remove image for ${key}`);
    }
  }
);

const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Public Images
    builder
      .addCase(fetchPublicImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublicImages.fulfilled, (state, action) => {
        state.loading = false;
        state.publicImages = action.payload;
      })
      .addCase(fetchPublicImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Admin Images List
    builder
      .addCase(fetchAdminImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminImages.fulfilled, (state, action) => {
        state.loading = false;
        state.adminImages = action.payload;
      })
      .addCase(fetchAdminImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload Image
    builder
      .addCase(uploadAdminImage.pending, (state, action) => {
        state.uploadingKey = action.meta.arg.key;
        state.error = null;
      })
      .addCase(uploadAdminImage.fulfilled, (state, action) => {
        state.uploadingKey = null;
        state.successMessage = `Updated image for ${action.payload.title}`;
        const updated = action.payload;
        
        // Update adminImages list
        const index = state.adminImages.findIndex((img) => img.key === updated.key);
        if (index >= 0) {
          state.adminImages[index] = updated;
        } else {
          state.adminImages.push(updated);
        }

        // Update publicImages cache
        state.publicImages[updated.key] = updated;
      })
      .addCase(uploadAdminImage.rejected, (state, action) => {
        state.uploadingKey = null;
        state.error = action.payload as string;
      });

    // Update Image Slot
    builder
      .addCase(updateAdminImage.fulfilled, (state, action) => {
        state.successMessage = `Saved changes for ${action.payload.title}`;
        const updated = action.payload;
        const index = state.adminImages.findIndex((img) => img.key === updated.key);
        if (index >= 0) {
          state.adminImages[index] = updated;
        }
        state.publicImages[updated.key] = updated;
      })
      .addCase(updateAdminImage.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Reset Image Slot
    builder
      .addCase(resetAdminImage.fulfilled, (state, action) => {
        state.successMessage = `Reset ${action.payload.title} to default`;
        const updated = action.payload;
        const index = state.adminImages.findIndex((img) => img.key === updated.key);
        if (index >= 0) {
          state.adminImages[index] = updated;
        }
        delete state.publicImages[updated.key];
      });

    // Remove Image
    builder
      .addCase(removeAdminImage.fulfilled, (state, action) => {
        state.successMessage = `Removed image for ${action.payload.title}`;
        const updated = action.payload;
        const index = state.adminImages.findIndex((img) => img.key === updated.key);
        if (index >= 0) {
          state.adminImages[index] = updated;
        }
        delete state.publicImages[updated.key];
      });
  },
});

export const { clearMessages } = imageSlice.actions;

export const selectPublicImages = (state: { images: ImageState }) => state.images.publicImages;
export const selectAdminImages = (state: { images: ImageState }) => state.images.adminImages;
export const selectImagesLoading = (state: { images: ImageState }) => state.images.loading;
export const selectUploadingKey = (state: { images: ImageState }) => state.images.uploadingKey;
export const selectImageError = (state: { images: ImageState }) => state.images.error;
export const selectImageSuccess = (state: { images: ImageState }) => state.images.successMessage;

export default imageSlice.reducer;
