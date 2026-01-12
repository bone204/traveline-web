import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";

const API_BASE_URL = "http://localhost:3000";

export interface CooperationContract {
  id: number;
  contractUrl: string;
  signedDate: string;
  expiryDate?: string;
  terms?: string;
  active: boolean;
  cooperation: {
    id: number;
    name: string;
    type: string;
  };
}

export const dashboardCooperationContractsApi = createApi({
  reducerPath: "dashboardCooperationContractsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["CooperationContracts"],
  endpoints: (builder) => ({
    getCooperationContracts: builder.query<CooperationContract[], void>({
      query: () => "cooperations/contracts/all",
      providesTags: ["CooperationContracts"],
    }),
  }),
});

export const { useGetCooperationContractsQuery } = dashboardCooperationContractsApi;
