import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import axiosInstance, { getErrorMessage } from "./axios";

// register user
export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (formData, thunkAPI) => {
        try {
            const response = await axiosInstance.post("auth/register/", formData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(getErrorMessage(error));
        }
    }
);

// logout user
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, thunkAPI) => {
        try {
            const refreshToken = Cookies.get("refresh_token");
            if (refreshToken) {
                await axiosInstance.post("auth/logout/", { refresh: refreshToken });
            }
            return true;
        } catch (error) {
            return thunkAPI.rejectWithValue(getErrorMessage(error));
        }
    }
);

// login user
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (formData, thunkAPI) => {
        try {
            const response = await axiosInstance.post("auth/login/", formData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(getErrorMessage(error));
        }
    }
);

// get logged in user profile
export const fetchProfile = createAsyncThunk(
    "auth/fetchProfile",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("auth/profile/");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(getErrorMessage(error));
        }
    }
);

// verify OTP
export const verifyOtp = createAsyncThunk(
    "auth/verifyOtp",
    async (formData, thunkAPI) => {
        try {
            const response = await axiosInstance.post("auth/verify-otp/", formData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(getErrorMessage(error));
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isLoggedIn: typeof window !== "undefined" ? !!Cookies.get("access_token") : false,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isLoggedIn = false;
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");
            })

            // login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                if (action.payload.access) {
                    Cookies.set("access_token", action.payload.access, { expires: 7 });
                }
                if (action.payload.refresh) {
                    Cookies.set("refresh_token", action.payload.refresh, { expires: 30 });
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // profile
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoggedIn = true;
            })
            .addCase(fetchProfile.rejected, (state) => {
                state.user = null;
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;