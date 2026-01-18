import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";
import { DashboardSummary, UserGrowthStats, RevenueStats, ServiceUsageStats } from "@/dto/statistics.dto";

const API_BASE_URL = "https://traveline-server.vercel.app";

export const statisticsApi = createApi({
  reducerPath: "statisticsApi",
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
  tagTypes: ["Statistics"],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => "statistics/dashboard-summary",
      providesTags: ["Statistics"],
    }),
    getUserGrowthStats: builder.query<UserGrowthStats[], 'year' | 'month' | void>({
      query: (period = 'year') => ({
        url: "statistics/user-growth",
        params: { period },
      }),
      providesTags: ["Statistics"],
    }),
    getRevenueStats: builder.query<RevenueStats[], void>({
      query: () => "statistics/revenue",
      providesTags: ["Statistics"],
    }),
    getServiceUsageStats: builder.query<ServiceUsageStats[], void>({
      query: () => "statistics/service-usage",
      providesTags: ["Statistics"],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetUserGrowthStatsQuery,
  useGetRevenueStatsQuery,
  useGetServiceUsageStatsQuery,
} = statisticsApi;
