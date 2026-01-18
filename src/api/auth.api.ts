import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginRequest, AuthTokens, UserProfile } from "@/dto/auth.dto";
import {
  setAccessToken,
  setRefreshToken,
  setRole,
  getAccessToken,
  clearTokens,
} from "@/utils/token";

const API_BASE_URL = "https://traveline-server.vercel.app";

export const authApi = createApi({
  reducerPath: "authApi",
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
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokens, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (tokens: AuthTokens) => {
        setAccessToken(tokens.access_token);
        setRefreshToken(tokens.refreshToken);
        if (tokens.role) setRole(tokens.role);
        return tokens;
      },
      invalidatesTags: [{ type: "Auth", id: "ME" }],
    }),
    me: builder.query<UserProfile, void>({
      query: () => ({ url: "auth/profile" }),
      transformResponse: (profile: UserProfile) => {
        if (profile.role) setRole(profile.role);
        return profile;
      },
      providesTags: [{ type: "Auth", id: "ME" }],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          // best-effort clear tokens on unauthorized
          clearTokens();
        }
      },
    }),
  }),
});

export const { useLoginMutation, useMeQuery } = authApi;
