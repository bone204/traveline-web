import axios from "axios";
import { getAccessToken } from "@/utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const getHeader = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
});

export interface Province {
  id: number;
  code: string;
  name: string;
  region?: string;
  imageUrl?: string;
  avatarUrl?: string;
}

export const provincesApi = {
  findAll: async () => {
    const response = await axios.get<Province[]>(`${API_URL}/provinces`);
    return response.data;
  },

  bulkUpdate: async (updates: { id: number; avatarUrl?: string; imageUrl?: string }[]) => {
    const response = await axios.patch<Province[]>(
      `${API_URL}/provinces/bulk/update`,
      updates,
      { headers: getHeader() }
    );
    return response.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // Note: Assuming there's a general upload endpoint at /common/upload/image
    // or similar. If not, I'll need to find where images are uploaded.
    const response = await axios.post<{ url: string }>(
      `${API_URL}/provinces/upload/avatar`,
      formData,
      {
        headers: {
          ...getHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
