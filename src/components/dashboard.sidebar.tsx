"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import travelIcon from "@/assets/icon/travel.svg";
import { logout } from "@/utils/token";

const NAV_ITEMS = [
  {
    label: "Trang chủ",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M5 9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5zm0 13a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5zm10 0a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4zm0-8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4z" fill="currentColor"/></g></svg>
    ),
  },
  {
    label: "Địa điểm",
    href: "/dashboard/destinations",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5z"/></svg>
    ),
  },
  {
    label: "Người dùng",
    href: "/dashboard/users",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 512"><path fill="currentColor" d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6c40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32S208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"/></svg>
    ),
  },
  {
    label: "Hợp đồng",
    href: "/dashboard/contracts",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 15 15"><path fill="currentColor" d="M6.796 11.9H6.8h-.003Z"/><path fill="currentColor" fillRule="evenodd" d="M1 1.5A1.5 1.5 0 0 1 2.5 0h8.207L14 3.293V13.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 1 13.5v-12ZM7 4H4v1h3V4Zm4 3H4v1h7V7Zm-4.695 3.908c-.404.108-.72.417-.83.75l-.95-.316c.223-.667.807-1.208 1.52-1.4c.707-.19 1.514-.03 2.212.611a2.75 2.75 0 0 1 .622-.107c.54-.029 1.023.107 1.438.28c.305.127.6.287.85.422c.078.044.153.084.222.12c.323.17.5.232.611.232v1c-.39 0-.774-.188-1.076-.346a21.802 21.802 0 0 1-.272-.146a7.689 7.689 0 0 0-.72-.359c-.334-.14-.663-.222-.999-.204a1.686 1.686 0 0 0-.15.014l.001.014c.027.324-.107.591-.28.783c-.318.354-.837.54-1.227.61a1.962 1.962 0 0 1-.614.025a.9.9 0 0 1-.33-.11a.623.623 0 0 1-.303-.433a.677.677 0 0 1 .111-.48a1.28 1.28 0 0 1 .262-.282c.19-.157.465-.327.834-.513l.027-.02a1.23 1.23 0 0 0-.96-.145Z" clipRule="evenodd"/></svg>
    ),
  },
  {
    label: "Xe cho thuê",
    href: "/dashboard/vehicles",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill="currentColor" d="m3.044 6l-.01.074A1.5 1.5 0 0 0 2 7.5v3A1.5 1.5 0 0 0 3.5 12h9a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.04-1.428L12.951 6h.549a.5.5 0 0 0 0-1h-.677l-.16-1.253A2 2 0 0 0 10.68 2H5.319a2 2 0 0 0-1.984 1.744L3.173 5H2.5a.5.5 0 0 0 0 1h.544Zm2.275-3h5.36a1 1 0 0 1 .992.873L11.943 6h-7.89l.274-2.128A1 1 0 0 1 5.319 3ZM5.25 9.749a.749.749 0 1 1 0-1.498a.749.749 0 0 1 0 1.498Zm5.498 0a.749.749 0 1 1 0-1.498a.749.749 0 0 1 0 1.498ZM12.497 13h-1.5v.25a.75.75 0 0 0 1.5 0V13ZM5 13H3.5v.25a.75.75 0 0 0 1.5 0V13Z"/></svg>
    ),
  },
  {
    label: "Danh mục xe",
    href: "/dashboard/vehicle-catalog",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
    ),
  },
  {
    label: "Voucher",
    href: "/dashboard/vouchers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42M5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4S7 4.67 7 5.5S6.33 7 5.5 7m11.77 8.27L13 19.54l-4.27-4.27A2.5 2.5 0 0 1 8.5 11c1.38 0 2.5 1.12 2.5 2.5c0 .69-.28 1.32-.73 1.77l.01.01L13 18l2.77-2.77c-.45-.45-.73-1.08-.73-1.77c0-1.38 1.12-2.5 2.5-2.5c.69 0 1.32.28 1.77.73z"/></svg>
    ),
  },
  {
    label: "Tỉnh thành",
    href: "/dashboard/provinces",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M15 11V5l-3-3l-3 3v2H3v14h18V11h-6zm-2 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm-12 4H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2z"/></svg>
    ),
  },
  {
    label: "Đối tác",
    href: "/dashboard/partners",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19.291 6h.71a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-2l-4.17-5.836a2 2 0 0 0-2.201-.753l-2.486.746a2 2 0 0 1-1.988-.502l-.293-.293a1 1 0 0 1 .152-1.539l5.401-3.6a2 2 0 0 1 2.183-.024l4.156 2.645A1 1 0 0 0 19.29 6ZM5.027 14.295l-1.616 1.414a1 1 0 0 0 .041 1.538l5.14 4.04a1 1 0 0 0 1.487-.29l.704-1.232a2 2 0 0 0-.257-2.338l-2.702-2.973a2 2 0 0 0-2.797-.16ZM7.046 5H3a1 1 0 0 0-1 1v7.516a2 2 0 0 0 .35 1.13a2.61 2.61 0 0 1 .074-.066l1.615-1.414a3.5 3.5 0 0 1 4.895.28l2.702 2.972a3.5 3.5 0 0 1 .45 4.09l-.655 1.146a2 2 0 0 0 1.738-.155l4.41-2.646a1 1 0 0 0 .299-1.438l-5.267-7.379a.5.5 0 0 0-.55-.188l-2.486.745a3.5 3.5 0 0 1-3.48-.877l-.293-.293a2.5 2.5 0 0 1 .38-3.848L7.047 5Z"/></svg>
    ),
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__brand">
        <Link href="/dashboard" className="dashboard-sidebar__logo">
          <Image
            src={travelIcon}
            alt="Traveline Logo"
            width={28}
            height={28}
            className="dashboard-sidebar__icon"
          />
          <span className="dashboard-sidebar__title">Traveline</span>
        </Link>
      </div>

      <nav className="dashboard-sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`dashboard-sidebar__link ${isActive ? "active" : ""}`}
            >
              <span className="dashboard-sidebar__link-icon">{item.icon}</span>
              <span className="dashboard-sidebar__link-text">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="dashboard-sidebar__footer">
        <button onClick={handleLogout} className="dashboard-sidebar__logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
