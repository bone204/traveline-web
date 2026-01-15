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
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Báo cáo & Thống kê</h1>
        <p className="dashboard-subtitle">Tổng quan về người dùng, doanh thu và dịch vụ</p>
      </div>
      
      {/* Summary Cards */}
      <div className="dashboard-detail-grid mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tổng người dùng</p>
          <div className="flex items-end gap-3">
             <h2 className="text-3xl font-bold text-slate-800">{summary?.totalUsers || 0}</h2>
             <span className="text-sm font-medium text-emerald-600 mb-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                +{summary?.newUsers || 0} tháng này
             </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tổng lộ trình</p>
          <h2 className="text-3xl font-bold text-slate-800">{summary?.totalRoutes || 0}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tổng doanh thu</p>
          <h2 className="text-3xl font-bold text-slate-800">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary?.totalRevenue || 0)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Doanh thu TB / Người dùng</p>
            <h2 className="text-3xl font-bold text-slate-800">
                {summary?.totalUsers ? 
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((summary.totalRevenue || 0) / summary.totalUsers) 
                    : 'N/A'
                }
            </h2>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <RevenueChart data={revenue || []} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <UserGrowthChart data={userGrowth || []} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 xl:col-span-2">
           <ServiceUsageChart data={serviceUsage || []} />
        </div>
      </div>
    </div>
  );
}
