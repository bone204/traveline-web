import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";
import type { RegisterCooperationDto, Cooperation } from "@/dto/cooperation.dto";

const API_BASE_URL = "http://localhost:3000";

export const cooperationsApi = createApi({
  reducerPath: "cooperationsApi",
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
  tagTypes: ["Cooperation"],
  endpoints: (builder) => ({
    register: builder.mutation<Cooperation, RegisterCooperationDto>({
      query: (body) => ({
        url: "cooperations/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cooperation"],
    }),
    getMyCooperations: builder.query<Cooperation[], void>({
      query: () => "cooperations", // The existing GET /cooperations list all, but for a user it might need filter or a specific endpoint. 
      // The current server implementation of GET /cooperations supports filtering.
      // If we want "my" cooperations, we should probably filter by managerId or usage on server.
      // However, usually a partner only has one cooperation.
    }),
  }),
});

export const { useRegisterMutation, useGetMyCooperationsQuery } = cooperationsApi;
