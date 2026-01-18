import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { destinationsApi } from "@/api/destinations.api";
import { authApi } from "@/api/auth.api";
import { dashboardDestinationsApi } from "@/app/dashboard/destinations/destinations.api";
import { dashboardContractsApi } from "@/app/dashboard/contracts/contracts.api";
import { dashboardPartnersApi } from "@/app/dashboard/partners/partners.api";
import { dashboardUsersApi } from "@/app/dashboard/users/users.api";
import { dashboardVehicleCatalogApi } from "@/app/dashboard/vehicle-catalog/vehicle-catalog.api";
import { dashboardVehiclesApi } from "@/app/dashboard/vehicles/vehicles.api";
import { dashboardVouchersApi } from "@/app/dashboard/vouchers/vouchers.api";
import { rentalBillsApi } from "@/api/rental-bills.api";
import { cooperationsApi } from "@/api/cooperations.api";
import { dashboardCooperationContractsApi } from "@/app/dashboard/cooperation-contracts/cooperation-contracts.api";
import { statisticsApi } from "@/api/statistics.api";

export const store = configureStore({
  reducer: {
    [destinationsApi.reducerPath]: destinationsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardDestinationsApi.reducerPath]: dashboardDestinationsApi.reducer,
    [dashboardContractsApi.reducerPath]: dashboardContractsApi.reducer,
    [dashboardPartnersApi.reducerPath]: dashboardPartnersApi.reducer,
    [dashboardUsersApi.reducerPath]: dashboardUsersApi.reducer,
    [dashboardVehicleCatalogApi.reducerPath]: dashboardVehicleCatalogApi.reducer,
    [dashboardVehiclesApi.reducerPath]: dashboardVehiclesApi.reducer,
    [dashboardVouchersApi.reducerPath]: dashboardVouchersApi.reducer,
    [rentalBillsApi.reducerPath]: rentalBillsApi.reducer,
    [cooperationsApi.reducerPath]: cooperationsApi.reducer,
    [dashboardCooperationContractsApi.reducerPath]: dashboardCooperationContractsApi.reducer,
    [statisticsApi.reducerPath]: statisticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      destinationsApi.middleware,
      authApi.middleware,
      dashboardDestinationsApi.middleware,
      dashboardContractsApi.middleware,
      dashboardPartnersApi.middleware,
      dashboardUsersApi.middleware,
      dashboardVehicleCatalogApi.middleware,
      dashboardVehiclesApi.middleware,
      dashboardVouchersApi.middleware,
      rentalBillsApi.middleware,
      cooperationsApi.middleware,
      dashboardCooperationContractsApi.middleware,
      statisticsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
