import axios from 'axios';

// Assuming base URL is configured in a global instance or environment variable
// If there's a common 'api' instance, I should use that. 
// For now, I'll use a basic implementation and adjust if I see a pattern later.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface DashboardSummary {
  totalUsers: number;
  totalRoutes: number;
  totalRevenue: number;
  newUsers: number;
}

export interface ChartData {
  name: string;
  value?: number;
  users?: number;
  revenue?: number;
}

export const statisticsService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await axios.get(`${API_URL}/statistics/dashboard-summary`);
    return response.data;
  },

  getUserGrowthStats: async (period: 'year' | 'month' = 'year'): Promise<ChartData[]> => {
    const response = await axios.get(`${API_URL}/statistics/user-growth`, { params: { period } });
    return response.data;
  },

  getRevenueStats: async (): Promise<ChartData[]> => {
    const response = await axios.get(`${API_URL}/statistics/revenue`);
    return response.data;
  },

  getServiceUsageStats: async (): Promise<ChartData[]> => {
    const response = await axios.get(`${API_URL}/statistics/service-usage`);
    return response.data;
  },
};
