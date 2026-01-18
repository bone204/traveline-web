import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://traveline-server.vercel.app";

export interface AdminUnit {
  code: string;
  name: string;
}

export const administrativeApi = {
  getProvinces: async () => {
    const response = await axios.get<AdminUnit[]>(`${API_URL}/vn-admin/legacy/provinces`);
    return response.data;
  },
  getDistricts: async (provinceCode: string) => {
    const response = await axios.get<AdminUnit[]>(`${API_URL}/vn-admin/legacy/provinces/${provinceCode}/districts`);
    return response.data;
  },
  getWards: async (districtCode: string) => {
    const response = await axios.get<AdminUnit[]>(`${API_URL}/vn-admin/legacy/districts/${districtCode}/wards`);
    return response.data;
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post<{ url: string }>(
      `${API_URL}/cooperations/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("traveline_access_token")}`,
        },
      }
    );
    return response.data;
  }
};
