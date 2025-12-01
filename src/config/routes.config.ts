/**
 * Danh sách các routes không hiển thị header và footer
 * Thêm route mới vào đây để tự động ẩn header/footer cho trang đó
 */
export const FULLSCREEN_ROUTES = [
  "/empty-page",
  // Thêm các routes khác cần fullscreen ở đây
  // Ví dụ: "/checkout", "/payment", "/admin", etc.
] as const;

/**
 * Kiểm tra xem route có phải là fullscreen route không
 */
export function isFullscreenRoute(pathname: string): boolean {
  return FULLSCREEN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

