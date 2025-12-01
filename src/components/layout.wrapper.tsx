"use client";

import { usePathname } from "next/navigation";
import AppHeader from "@/components/app.header";
import AppFooter from "@/components/app.footer";
import { isFullscreenRoute } from "@/config/routes.config";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = isFullscreenRoute(pathname || "");

  return (
    <>
      {!isFullscreen && <AppHeader />}
      <main className={`app-shell ${isFullscreen ? "app-shell--fullscreen" : ""}`}>
        {children}
      </main>
      {!isFullscreen && <AppFooter />}
    </>
  );
}

