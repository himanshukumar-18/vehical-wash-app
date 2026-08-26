import api from "../axios";

export interface DynamicImageItem {
  id?: number;
  key: string;
  title: string;
  category: string;
  description?: string;
  desktop_image_url: string;
  mobile_image_url?: string | null;
  alt_text?: string;
  badge_tag?: string;
  link_url?: string | null;
  format?: string;
  file_size_bytes?: number;
  file_size_mb?: number;
  width?: number;
  height?: number;
  recommended_resolution?: string;
  aspect_ratio?: string;
  max_file_size_mb?: number;
  is_active: boolean;
  updated_at?: string;
  created_at?: string;
}

export interface PublicImagesResponse {
  success: boolean;
  data: Record<string, DynamicImageItem>;
}

export interface AdminImagesResponse {
  count?: number;
  results?: DynamicImageItem[];
  [key: string]: any;
}

export const imageApi = {
  getPublicImages: async (): Promise<Record<string, DynamicImageItem>> => {
    const response = await api.get<PublicImagesResponse>("/images/");
    return response.data.data;
  },

  getAdminImages: async (): Promise<DynamicImageItem[]> => {
    const response = await api.get<AdminImagesResponse | DynamicImageItem[]>("/admin/images/");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  uploadImage: async (key: string, file: File, variant: "desktop" | "mobile" = "desktop"): Promise<DynamicImageItem> => {
    const formData = new FormData();
    formData.append("key", key);
    formData.append("file", file);
    formData.append("variant", variant);

    const response = await api.post<{ success: boolean; data: DynamicImageItem }>(
      "/admin/images/upload/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  updateImage: async (key: string, data: Partial<DynamicImageItem>): Promise<DynamicImageItem> => {
    const response = await api.patch<DynamicImageItem>(`/admin/images/${key}/`, data);
    return response.data;
  },

  resetImage: async (key: string): Promise<DynamicImageItem> => {
    const response = await api.post<{ success: boolean; data: DynamicImageItem }>(`/admin/images/${key}/reset/`);
    return response.data.data;
  },

  removeImage: async (key: string): Promise<DynamicImageItem> => {
    const response = await api.post<{ success: boolean; data: DynamicImageItem }>(`/admin/images/${key}/remove/`);
    return response.data.data;
  },
};
