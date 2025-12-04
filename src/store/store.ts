import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { destinationsApi } from "@/api/destinations.api";
import { authApi } from "@/api/auth.api";
import { dashboardDestinationsApi } from "@/app/dashboard/destinations/destinations.api";

export const store = configureStore({
  reducer: {
    [destinationsApi.reducerPath]: destinationsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardDestinationsApi.reducerPath]: dashboardDestinationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      destinationsApi.middleware,
      authApi.middleware,
      dashboardDestinationsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
