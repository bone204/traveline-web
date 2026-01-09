import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";

const API_BASE_URL = "http://localhost:3000";

export interface Partner {
  id: number;
  code?: string;
  name: string;
  type: string;
  numberOfObjects: number;
  numberOfObjectTypes: number;
  bossName?: string;
  bossPhone?: string;
  bossEmail?: string;
  address?: string;
  district?: string;
  city?: string;
  province?: string;
  photo?: string;
  extension?: string;
  introduction?: string;
  contractDate?: string;
  contractTerm?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  bookingTimes: number;
  revenue: string;
  averageRating: string;
  active: boolean;
  manager?: {
    id: number;
    email: string;
    name?: string;
  };
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export const dashboardPartnersApi = createApi({
  reducerPath: "dashboardPartnersApi",
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
  tagTypes: ["DashboardPartners"],
  endpoints: (builder) => ({
    getPartners: builder.query<Partner[], void>({
      query: () => "cooperations",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "DashboardPartners" as const, id })),
              { type: "DashboardPartners", id: "LIST" },
            ]
          : [{ type: "DashboardPartners", id: "LIST" }],
    }),
    getPartnerById: builder.query<Partner, number>({
      query: (id) => `cooperations/${id}`,
      providesTags: (result, error, id) => [{ type: "DashboardPartners", id }],
    }),
    deletePartner: builder.mutation<void, number>({
      query: (id) => ({
        url: `cooperations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DashboardPartners", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerByIdQuery,
  useDeletePartnerMutation,
} = dashboardPartnersApi;
