import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";

const API_BASE_URL = "http://localhost:3000";

export enum ContractStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export interface ContractItem {
  id: number;
  userId: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  businessType: string;
  businessName?: string;
  citizenId?: string;
  status: ContractStatus;
  totalVehicles: number;
  totalRentalTimes: number;
  averageRating: number;
  createdAt?: string;
  statusUpdatedAt?: string;
}

export const dashboardContractsApi = createApi({
  reducerPath: "dashboardContractsApi",
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
  tagTypes: ["DashboardContracts"],
  endpoints: (builder) => ({
    getContracts: builder.query<ContractItem[], void>({
      query: () => "rental-contracts",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "DashboardContracts" as const, id })),
              { type: "DashboardContracts", id: "LIST" },
            ]
          : [{ type: "DashboardContracts", id: "LIST" }],
    }),
    deleteContract: builder.mutation<void, number>({
      query: (id) => ({
        url: `rental-contracts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DashboardContracts", id: "LIST" }],
    }),
    approveContract: builder.mutation<void, number>({
      query: (id) => ({
        url: `rental-contracts/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "DashboardContracts", id },
        { type: "DashboardContracts", id: "LIST" },
      ],
    }),
    rejectContract: builder.mutation<void, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `rental-contracts/${id}/reject`,
        method: "PATCH",
        body: { rejectedReason: reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DashboardContracts", id },
        { type: "DashboardContracts", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetContractsQuery,
  useDeleteContractMutation,
  useApproveContractMutation,
  useRejectContractMutation,
} = dashboardContractsApi;
