import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";

const API_BASE_URL = "http://localhost:3000";

export interface VehicleCatalogItem {
  id: number;
  type: string;
  brand: string;
  model: string;
  color: string;
  seatingCapacity: number;
  fuelType?: string;
  maxSpeed?: number;
  transmission?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export const dashboardVehicleCatalogApi = createApi({
  reducerPath: "dashboardVehicleCatalogApi",
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
  tagTypes: ["DashboardVehicleCatalog"],
  endpoints: (builder) => ({
    getVehicleCatalogs: builder.query<VehicleCatalogItem[], void>({
      query: () => "vehicle-catalog",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "DashboardVehicleCatalog" as const, id })),
              { type: "DashboardVehicleCatalog", id: "LIST" },
            ]
          : [{ type: "DashboardVehicleCatalog", id: "LIST" }],
      transformResponse: (response: unknown[]) => {
        if (!Array.isArray(response)) return [];
        return response.map((item: unknown): VehicleCatalogItem => {
            const c = item as Record<string, unknown>;
            return {
                id: Number(c.id ?? 0),
                type: String(c.type ?? ""),
                brand: String(c.brand ?? ""),
                model: String(c.model ?? ""),
                color: String(c.color ?? ""),
                seatingCapacity: Number(c.seatingCapacity ?? 0),
                fuelType: typeof c.fuelType === "string" ? c.fuelType : undefined,
                maxSpeed: typeof c.maxSpeed === "number" ? c.maxSpeed : undefined,
                transmission: typeof c.transmission === "string" ? c.transmission : undefined,
                photo: typeof c.photo === "string" ? c.photo : undefined,
                createdAt: typeof c.createdAt === "string" ? c.createdAt : new Date().toISOString(),
                updatedAt: typeof c.updatedAt === "string" ? c.updatedAt : new Date().toISOString(),
            };
        });
      },
    }),
    deleteVehicleCatalog: builder.mutation<void, number>({
      query: (id) => ({
        url: `vehicle-catalog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DashboardVehicleCatalog", id: "LIST" }],
    }),
  }),
});

export const {
  useGetVehicleCatalogsQuery,
  useDeleteVehicleCatalogMutation,
} = dashboardVehicleCatalogApi;
