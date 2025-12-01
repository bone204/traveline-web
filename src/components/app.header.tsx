"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginModal } from "./login.modal";
import travelIcon from "@/assets/icon/travel.svg";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Điểm đến", href: "/bone" },
  { label: "Tour", href: "/empty-page" },
  { label: "Khách sạn", href: "/empty-page" },
  { label: "Liên hệ", href: "/empty-page" },
];

function AppHeader() {
  const pathname = usePathname();
  const [isSolid, setIsSolid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setIsSolid(current > 120);
    };

    setTimeout(() => setMounted(true), 0);
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
          <span className="brand-icon">
            <Image
              src={travelIcon}
              alt="Biểu tượng Traveline"
              width={28}
              height={28}
              priority
            />
          </span>
          <span className="brand-text">Traveline</span>
        </Link>
        <div className="app-header__actions">
          <nav className="tabs" role="tablist" aria-label="Điều hướng chính">
            {navItems.map((item) => {
              const active = mounted && pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.label}
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
          <div className="app-header__auth">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="app-header__auth-btn app-header__auth-btn--login"
            >
              Đăng nhập
            </button>
            <Link
              href="/empty-page"
              className="app-header__auth-btn app-header__auth-btn--register"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}

export default AppHeader;