import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";

const API_BASE_URL = "http://localhost:3000";

export type VoucherDiscountType = "percentage" | "fixed";

export interface VoucherItem {
  id: number;
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  value: string;
  maxDiscountValue?: string;
  minOrderValue?: string;
  usedCount: number;
  maxUsage: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoucherPayload {
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  value: number;
  maxDiscountValue?: number;
  minOrderValue?: number;
  maxUsage: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
}

export const dashboardVouchersApi = createApi({
  reducerPath: "dashboardVouchersApi",
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
  tagTypes: ["DashboardVouchers"],
  endpoints: (builder) => ({
    getVouchers: builder.query<VoucherItem[], void>({
      query: () => "vouchers",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "DashboardVouchers" as const, id })),
              { type: "DashboardVouchers", id: "LIST" },
            ]
          : [{ type: "DashboardVouchers", id: "LIST" }],
    }),
    getVoucherById: builder.query<VoucherItem, number>({
      query: (id) => `vouchers/${id}`,
      providesTags: (result, error, id) => [{ type: "DashboardVouchers", id }],
    }),
    createVoucher: builder.mutation<VoucherItem, CreateVoucherPayload>({
      query: (body) => ({
        url: "vouchers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "DashboardVouchers", id: "LIST" }],
    }),
    deleteVoucher: builder.mutation<void, number>({
      query: (id) => ({
        url: `vouchers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "DashboardVouchers", id },
        { type: "DashboardVouchers", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetVouchersQuery,
  useGetVoucherByIdQuery,
  useCreateVoucherMutation,
  useDeleteVoucherMutation,
} = dashboardVouchersApi;
