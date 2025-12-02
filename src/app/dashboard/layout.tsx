"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "./components/dashboard.sidebar";
import { getAccessToken, isTokenValid, logout } from "@/services/auth.service";

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
      
      if (!token || !isTokenValid(token)) {
        logout();
        router.replace("/");
        return;
      }
      // Simpler check: just verify token existence/validity for now since we don't need user profile in layout anymore
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner"></div>
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
