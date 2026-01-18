import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LocationCardProps } from "@/components/location.card";
import type { DestinationDto } from "@/dto/destination.dto";

const API_BASE_URL = "http://localhost:3000";

function mapDestinationToLocationCard(destination: DestinationDto): LocationCardProps {
  const {
    id,
    name,
    descriptionViet,
    descriptionEng,
    province,
    district,
    photos,
    rating,
  } = destination;

  const description =
    descriptionViet ??
    descriptionEng ??
    "Địa điểm đang chờ bạn khám phá cùng Traveline.";

  const imageUrl =
    photos && photos.length > 0
      ? photos[0]
      : "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop";

  const locationLabel = [district, province].filter(Boolean).join(", ");

  return {
    id: String(id),
    name,
    description,
    imageUrl,
    rating,
    location: locationLabel || undefined,
    href: "/empty-page",
  };
}

export const destinationsApi = createApi({
  reducerPath: "destinationsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Destinations"],
  endpoints: (builder) => ({
    getDestinations: builder.query<
      LocationCardProps[],
      { q?: string; limit?: number; offset?: number; available?: boolean }
    >({
      query: ({ q, limit, offset, available } = {}) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (limit !== undefined) params.set("limit", String(limit));
        if (offset !== undefined) params.set("offset", String(offset));
        if (available !== undefined) params.set("available", String(available));
        const queryString = params.toString();
        return {
          url: `destinations${queryString ? `?${queryString}` : ""}`,
        };
      },
      transformResponse: (response: DestinationDto[]) =>
        response.map(mapDestinationToLocationCard),
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: "Destinations" as const, id: d.id })),
              { type: "Destinations", id: "LIST" },
            ]
          : [{ type: "Destinations", id: "LIST" }],
    }),
  }),
});

export const { useGetDestinationsQuery } = destinationsApi;
