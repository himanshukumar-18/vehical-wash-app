import axios from "axios";
import Cookies from "js-cookie";

const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";
  return url.endsWith("/") ? url : `${url}/`;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not retry refresh token requests
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("auth/token/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");

        if (!refreshToken) {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(`${getBaseURL()}auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;
        Cookies.set("access_token", newAccessToken, { expires: 7 });

        if (refreshResponse.data.refresh) {
          Cookies.set("refresh_token", refreshResponse.data.refresh, { expires: 30 });
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: any): string => {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.detail) return data.detail;
    if (data.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey) {
        const val = data.errors[firstKey];
        return Array.isArray(val) ? `${firstKey}: ${val.join(", ")}` : String(val);
      }
    }
    if (typeof data === "object") {
      const entries = Object.entries(data);
      if (entries.length > 0) {
        return entries
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
          .join(" | ");
      }
    }
  }
  if (error.message) return error.message;
  return "Network or server error occurred.";
};

export default axiosInstance;