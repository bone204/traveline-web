import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";

const API_BASE_URL = "http://localhost:3000";

export interface UserItem {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  userTier?: string;
  createdAt?: string;
}

export const dashboardUsersApi = createApi({
  reducerPath: "dashboardUsersApi",
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
  tagTypes: ["DashboardUsers"],
  endpoints: (builder) => ({
    getUsers: builder.query<UserItem[], void>({
      query: () => "users",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "DashboardUsers" as const, id })),
              { type: "DashboardUsers", id: "LIST" },
            ]
          : [{ type: "DashboardUsers", id: "LIST" }],
      transformResponse: (response: unknown[]) => {
        if (!Array.isArray(response)) return [];
        return response.map((item: unknown): UserItem => {
          const u = item as Record<string, unknown>;
          return {
            id: Number(u.id ?? 0),
            username: String(u.username ?? ""),
            fullName: typeof u.fullName === "string" ? u.fullName : (typeof u.name === "string" ? u.name : undefined),
            email: typeof u.email === "string" ? u.email : undefined,
            phone: typeof u.phone === "string" ? u.phone : undefined,
            userTier: typeof u.userTier === "string" ? u.userTier : undefined,
            createdAt: typeof u.createdAt === "string" ? u.createdAt : (u.createdAt instanceof Date ? u.createdAt.toISOString() : undefined),
          };
        });
      }
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DashboardUsers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useDeleteUserMutation,
} = dashboardUsersApi;
