export interface DashboardSummary {
  totalUsers: number;
  totalRoutes: number;
  totalRevenue: number;
  newUsers: number;
}

export interface UserGrowthStats {
  name: string;
  users: number;
}

export interface RevenueStats {
  name: string;
  revenue: number;
}

export interface ServiceUsageStats {
  name: string;
  value: number;
}
