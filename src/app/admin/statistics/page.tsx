'use client';

import { 
  useGetDashboardSummaryQuery, 
  useGetUserGrowthStatsQuery, 
  useGetRevenueStatsQuery, 
  useGetServiceUsageStatsQuery 
} from "@/api/statistics.api";
import UserGrowthChart from "@/components/admin/statistics/UserGrowthChart";
import RevenueChart from "@/components/admin/statistics/RevenueChart";
import ServiceUsageChart from "@/components/admin/statistics/ServiceUsageChart";

export default function StatisticsPage() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummaryQuery();
  const { data: userGrowth, isLoading: isUserGrowthLoading } = useGetUserGrowthStatsQuery('year');
  const { data: revenue, isLoading: isRevenueLoading } = useGetRevenueStatsQuery();
  const { data: serviceUsage, isLoading: isServiceUsageLoading } = useGetServiceUsageStatsQuery();

  if (isSummaryLoading || isUserGrowthLoading || isRevenueLoading || isServiceUsageLoading) {
    return <div className="p-8 text-center text-gray-500">Loading statistics...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Reports & Statistics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Users</p>
          <h2 className="text-3xl font-bold text-blue-600">{summary?.totalUsers || 0}</h2>
          <p className="text-xs text-green-500 mt-2">+{summary?.newUsers || 0} this month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Routes</p>
          <h2 className="text-3xl font-bold text-indigo-600">{summary?.totalRoutes || 0}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <h2 className="text-3xl font-bold text-green-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary?.totalRevenue || 0)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Avg Revenue / User</p>
            <h2 className="text-3xl font-bold text-orange-600">
                {summary?.totalUsers ? 
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((summary.totalRevenue || 0) / summary.totalUsers) 
                    : 'N/A'
                }
            </h2>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenue || []} />
        <UserGrowthChart data={userGrowth || []} />
        <ServiceUsageChart data={serviceUsage || []} />
      </div>
    </div>
  );
}
