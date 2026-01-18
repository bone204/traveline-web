"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "../../components/dashboard.sidebar";
import { getAccessToken, getRole, isTokenValid, logout } from "@/utils/token";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      const role = getRole();
      
      if (!token || !isTokenValid(token)) {
        logout();
        router.replace("/");
        return;
      }

      if (role !== "admin") {
        router.replace("/");
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout-v2">
      <DashboardSidebar />
      <div className="dashboard-main-container">
        <main className="dashboard-content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
