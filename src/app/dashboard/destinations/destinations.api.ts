import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";

export interface Destination {
  id: number;
  name: string;
  type?: string;
  descriptionViet?: string;
  descriptionEng?: string;
  province?: string;
  district?: string;
  districtCode?: string;
  specificAddress?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  favouriteTimes: number;
  userRatingsTotal: number;
  categories: string[];
  photos: string[];
  videos: string[];
  googlePlaceId?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = "http://localhost:3000";

export const dashboardDestinationsApi = createApi({
  reducerPath: "dashboardDestinationsApi",
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
  tagTypes: ["DashboardDestinations"],
  endpoints: (builder) => ({
    getDashboardDestinations: builder.query<Destination[], void>({
      query: () => "destinations",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "DashboardDestinations" as const, id })),
              { type: "DashboardDestinations", id: "LIST" },
            ]
          : [{ type: "DashboardDestinations", id: "LIST" }],
    }),
    deleteDestination: builder.mutation<void, number>({
      query: (id) => ({
        url: `destinations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "DashboardDestinations", id }, { type: "DashboardDestinations", id: "LIST" }],
    }),
  }),
});

export const { useGetDashboardDestinationsQuery, useDeleteDestinationMutation } = dashboardDestinationsApi;
