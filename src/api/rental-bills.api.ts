import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GuestBillResponse, SubmitEvidenceRequest } from "@/dto/rental-bill.dto";

const API_BASE_URL = "http://localhost:3000";

export const rentalBillsApi = createApi({
  reducerPath: "rentalBillsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    // No auth header needed for guest endpoints, or handled by browser if using cookies?
    // Guest endpoints are public, but we might need prepareHeaders if we were reusing this for auth'd stuff.
    // For now, simple baseQuery is fine.
  }),
  tagTypes: ["RentalBill"],
  endpoints: (builder) => ({
    getGuestBill: builder.query<GuestBillResponse, string>({
      query: (token) => `rental-bills/guest/${token}`,
      providesTags: ["RentalBill"],
    }),
    submitGuestEvidence: builder.mutation<void, SubmitEvidenceRequest>({
      query: ({ token, files, latitude, longitude }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("photos", file));
        formData.append("latitude", latitude.toString());
        formData.append("longitude", longitude.toString());

        return {
          url: `rental-bills/guest/${token}/evidence`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["RentalBill"],
    }),
  }),
});

export const { useGetGuestBillQuery, useSubmitGuestEvidenceMutation } = rentalBillsApi;
