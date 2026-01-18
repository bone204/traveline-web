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
    <div className="dashboard-view" style={{ 
      overflowY: "auto",
      maxHeight: "calc(100vh - 40px)",
      paddingBottom: "3rem"
    }}>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {/* User Card */}
        <div style={{ position: "relative", overflow: "hidden", background: "#fff", padding: "1.25rem", borderRadius: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ position: "absolute", top: "-1rem", right: "-1rem", width: "80px", height: "80px", background: "#f5f3ff", borderRadius: "50%" }}></div>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem", position: "relative" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem 0" }}>Người dùng</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
               <h2 style={{ fontSize: "1.875rem", fontWeight: "900", color: "#1e293b", margin: 0, letterSpacing: "-0.02em" }}>{summary?.totalUsers || 0}</h2>
               <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#059669", background: "#ecfdf5", padding: "0.15rem 0.4rem", borderRadius: "6px" }}>
                  +{summary?.newUsers || 0}
               </span>
            </div>
          </div>
        </div>
        
        {/* Routes Card */}
        <div style={{ position: "relative", overflow: "hidden", background: "#fff", padding: "1.25rem", borderRadius: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ position: "absolute", top: "-1rem", right: "-1rem", width: "80px", height: "80px", background: "#fff1f2", borderRadius: "50%" }}></div>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem", position: "relative" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem 0" }}>Lộ trình</p>
            <h2 style={{ fontSize: "1.875rem", fontWeight: "900", color: "#1e293b", margin: 0, letterSpacing: "-0.02em" }}>{summary?.totalRoutes || 0}</h2>
          </div>
        </div>
        
        {/* Revenue Card */}
        <div style={{ position: "relative", overflow: "hidden", background: "#fff", padding: "1.25rem", borderRadius: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ position: "absolute", top: "-1rem", right: "-1rem", width: "80px", height: "80px", background: "#ecfdf5", borderRadius: "50%" }}></div>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem", position: "relative" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem 0" }}>Doanh thu</p>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1e293b", margin: 0 }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary?.totalRevenue || 0)}
            </h2>
          </div>
        </div>

        {/* ARPU Card */}
        <div style={{ position: "relative", overflow: "hidden", background: "#fff", padding: "1.25rem", borderRadius: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ position: "absolute", top: "-1rem", right: "-1rem", width: "80px", height: "80px", background: "#fffbeb", borderRadius: "50%" }}></div>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem", position: "relative" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <polyline points="17 11 19 13 23 9" />
            </svg>
          </div>
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem 0" }}>Doanh thu / User</p>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1e293b", margin: 0 }}>
                {summary?.totalUsers ? 
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((summary.totalRevenue || 0) / summary.totalUsers) 
                    : 'N/A'
                }
            </h2>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.75rem" }}>
        {/* Revenue Chart */}
        <div style={{ background: "#fff", padding: "1.75rem", borderRadius: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Thống kê doanh thu</h3>
               <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: "600" }}>Doanh thu (6 tháng gần nhất)</p>
             </div>
             <div style={{ padding: "0.35rem 0.75rem", background: "#f1f5f9", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hàng tháng</div>
           </div>
           <RevenueChart data={revenue || []} />
        </div>
        
        {/* User Growth Chart */}
        <div style={{ background: "#fff", padding: "1.75rem", borderRadius: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Tăng trưởng người dùng</h3>
               <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: "600" }}>Số người dùng mới đăng ký</p>
             </div>
             <div style={{ padding: "0.35rem 0.75rem", background: "#f1f5f9", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hàng năm</div>
           </div>
           <UserGrowthChart data={userGrowth || []} />
        </div>
        
        {/* Service Usage Chart */}
        <div style={{ background: "#fff", padding: "1.75rem", borderRadius: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", gridColumn: "1 / -1" }}>
           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
               <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Hiệu suất dịch vụ</h3>
               <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0, fontWeight: "600" }}>Mức độ sử dụng dịch vụ (Loại xe)</p>
             </div>
             <div style={{ padding: "0.4rem 0.85rem", background: "#eef2ff", color: "#4f46e5", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phổ biến nhất</div>
           </div>
           <ServiceUsageChart data={serviceUsage || []} />
        </div>
      </div>
    </div>
  );
}
