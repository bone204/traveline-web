import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/utils/token";

const API_BASE_URL = "http://localhost:3000";

export enum VehicleApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  INACTIVE = "inactive",
}

export enum VehicleAvailabilityStatus {
  AVAILABLE = "available",
  RENTED = "rented",
  MAINTENANCE = "maintenance",
}

export type VehicleItem = {
  licensePlate: string;
  contractId: number;
  vehicleCatalogId?: number;
  pricePerHour: number;
  pricePerDay: number;
  requirements?: string;
  description?: string;
  vehicleRegistrationFront?: string;
  vehicleRegistrationBack?: string;
  status: VehicleApprovalStatus;
  rejectedReason?: string;
  availability: VehicleAvailabilityStatus;
  totalRentals: number;
  averageRating: number;
  createdAt?: string;
  updatedAt?: string;
};

export const dashboardVehiclesApi = createApi({
  reducerPath: "dashboardVehiclesApi",
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
  tagTypes: ["DashboardVehicles"],
  endpoints: (builder) => ({
    getVehicles: builder.query<VehicleItem[], void>({
      query: () => "rental-vehicles",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ licensePlate }) => ({ type: "DashboardVehicles" as const, id: licensePlate })),
              { type: "DashboardVehicles", id: "LIST" },
            ]
          : [{ type: "DashboardVehicles", id: "LIST" }],
      transformResponse: (response: unknown[]) => {
        if (!Array.isArray(response)) return [];
        return response.map((item: unknown): VehicleItem => {
            const obj = item as Record<string, unknown>;
            return {
                licensePlate: String(obj.licensePlate ?? ""),
                contractId: Number(obj.contractId ?? 0),
                vehicleCatalogId: obj.vehicleCatalogId ? Number(obj.vehicleCatalogId) : undefined,
                pricePerHour: Number(obj.pricePerHour ?? 0),
                pricePerDay: Number(obj.pricePerDay ?? 0),
                requirements: typeof obj.requirements === "string" ? obj.requirements : undefined,
                description: typeof obj.description === "string" ? obj.description : undefined,
                vehicleRegistrationFront: typeof obj.vehicleRegistrationFront === "string" ? obj.vehicleRegistrationFront : undefined,
                vehicleRegistrationBack: typeof obj.vehicleRegistrationBack === "string" ? obj.vehicleRegistrationBack : undefined,
                status: (obj.status as VehicleApprovalStatus) ?? VehicleApprovalStatus.PENDING,
                rejectedReason: typeof obj.rejectedReason === "string" ? obj.rejectedReason : undefined,
                availability: (obj.availability as VehicleAvailabilityStatus) ?? VehicleAvailabilityStatus.AVAILABLE,
                totalRentals: Number(obj.totalRentals ?? 0),
                averageRating: Number(obj.averageRating ?? 0),
                createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
                updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : undefined,
            };
        });
      },
    }),
    deleteVehicle: builder.mutation<void, string>({
      query: (licensePlate) => ({
        url: `rental-vehicles/${licensePlate}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DashboardVehicles", id: "LIST" }],
    }),
    approveVehicle: builder.mutation<void, string>({
      query: (licensePlate) => ({
        url: `rental-vehicles/${licensePlate}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, licensePlate) => [
        { type: "DashboardVehicles", id: licensePlate },
        { type: "DashboardVehicles", id: "LIST" }
      ],
    }),
    rejectVehicle: builder.mutation<void, { licensePlate: string; reason: string }>({
      query: ({ licensePlate, reason }) => ({
        url: `rental-vehicles/${licensePlate}/reject`,
        method: "PATCH",
        body: { rejectedReason: reason },
      }),
      invalidatesTags: (result, error, { licensePlate }) => [
        { type: "DashboardVehicles", id: licensePlate },
        { type: "DashboardVehicles", id: "LIST" }
      ],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useDeleteVehicleMutation,
  useApproveVehicleMutation,
  useRejectVehicleMutation,
} = dashboardVehiclesApi;
