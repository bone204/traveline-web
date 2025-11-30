"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Điểm đến", href: "/bone" },
  { label: "Tour", href: "/tours" },
  { label: "Khách sạn", href: "/hotels" },
  { label: "Liên hệ", href: "/contact" }
];

function AppHeader() {
  const pathname = usePathname();
  const [isSolid, setIsSolid] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setIsSolid(current > 120);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`app-header ${isSolid ? "app-header--solid" : "app-header--overlay"}`}
      role="banner"
    >
      <div className="app-header-inner">
        <Link href="/" className="brand" aria-label="Trang chủ">
          <span className="brand-icon">✈</span>
          <span className="brand-text">Bone Travel</span>
        </Link>
        <nav className="tabs" role="tablist" aria-label="Điều hướng chính">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="tab"
                aria-selected={active}
                aria-label={item.label}
                className={"tab-link" + (active ? " active" : "")}
              >
                <span className="tab-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;