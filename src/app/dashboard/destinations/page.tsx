"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { 
  useGetDashboardDestinationsQuery, 
  useDeleteDestinationMutation,
  type Destination 
} from "./destinations.api";

export default function DestinationsPage() {
  const { data: destinations = [], isLoading, error, refetch } = useGetDashboardDestinationsQuery();
  const [deleteDestination] = useDeleteDestinationMutation();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  
  // Modal state
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
        setOpenDropdown(null);
        setDropdownPosition(null);
    };

    if (openDropdown) {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const filtered = useMemo(() => {
    let result = destinations;
    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(d => 
        d.name.toLowerCase().includes(term) ||
        d.province?.toLowerCase().includes(term) ||
        d.district?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [destinations, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa địa điểm này?")) return;
    try {
      await deleteDestination(id).unwrap();
      setOpenDropdown(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Không thể xóa địa điểm");
    }
  };

  const handleViewDetail = (destination: Destination) => {
    setSelectedDestination(destination);
    setOpenDropdown(null);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        <p>Đang tải danh sách địa điểm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="dashboard-error-icon">⚠️</div>
        <p className="dashboard-error-message">Không thể tải dữ liệu</p>
        <div className="dashboard-error-actions">
          <button onClick={() => refetch()} className="dashboard-btn dashboard-btn--primary">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view" onClick={() => setOpenDropdown(null)}>
      <div className="dashboard-toolbar">
        <input
          className="dashboard-search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="🔍 Tìm kiếm theo tên, tỉnh/thành..."
        />
      </div>

      <div className="dashboard-table-container">
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th style={{ width: "250px" }}>Tên địa điểm</th>
                <th style={{ width: "150px" }}>Tỉnh/Thành</th>
                <th style={{ width: "150px" }}>Quận/Huyện</th>
                <th style={{ width: "100px" }}>Đánh giá</th>
                <th style={{ width: "100px" }}>Yêu thích</th>
                <th style={{ width: "100px" }}>Ngày tạo</th>
                <th style={{ width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                    Không tìm thấy địa điểm nào
                  </td>
                </tr>
              ) : (
                pageData.map((dest) => (
                  <tr key={dest.id}>
                    <td style={{ fontWeight: 600, color: "#64748b" }}>#{dest.id}</td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span>{dest.name}</span>
                      </div>
                    </td>
                    <td>{dest.province || "—"}</td>
                    <td>{dest.district || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <span style={{ fontWeight: 600 }}>{dest.rating || 0}</span>
                        <span style={{ color: "#fbbf24" }}>★</span>
                      </div>
                    </td>
                    <td>{dest.favouriteTimes || 0}</td>
                    <td>{dest.createdAt ? new Date(dest.createdAt).toLocaleDateString('vi-VN') : "—"}</td>
                    <td className="dashboard-action-cell">
                      <button
                        className="dashboard-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const windowHeight = window.innerHeight;
                          const dropdownHeight = 100;
                          
                          const spaceBelow = windowHeight - rect.bottom;
                          const shouldShowAbove = spaceBelow < dropdownHeight;
                          
                          setDropdownPosition({
                              top: shouldShowAbove ? rect.top - dropdownHeight : rect.bottom + 2,
                              right: window.innerWidth - rect.right
                          });
                          setOpenDropdown(openDropdown === dest.id ? null : dest.id);
                        }}
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="dashboard-pagination">
          <div className="dashboard-pagination-info">
            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} trong tổng số {filtered.length} địa điểm
          </div>
          <div className="dashboard-pagination-controls">
            <button 
              className="dashboard-pagination-btn"
              disabled={currentPage <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              ← Trước
            </button>
            <span style={{ padding: "0 0.75rem", color: "#475569", fontWeight: 500 }}>
              {currentPage} / {totalPages}
            </span>
            <button 
              className="dashboard-pagination-btn"
              disabled={currentPage >= totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown menu */}
      {openDropdown && dropdownPosition && (
        <div 
          className="dashboard-dropdown-fixed"
          style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
              zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {pageData.find(d => d.id === openDropdown) && (() => {
            const dest = pageData.find(d => d.id === openDropdown)!;
            return (
              <>
                <button
                  className="dashboard-dropdown-item"
                  onClick={() => handleViewDetail(dest)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Chi tiết
                </button>
                <button
                  className="dashboard-dropdown-item dashboard-dropdown-item--danger"
                  onClick={() => handleDelete(dest.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Xóa
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDestination && (
        <div className="dashboard-modal-overlay" onClick={() => setSelectedDestination(null)}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">Chi tiết địa điểm #{selectedDestination.id}</h2>
              <button className="dashboard-modal-close" onClick={() => setSelectedDestination(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="dashboard-modal-body">
              {selectedDestination.photos && selectedDestination.photos.length > 0 && (
                <div style={{ marginBottom: "1.5rem", width: "100%", height: "200px", position: "relative", borderRadius: "8px", overflow: "hidden" }}>
                   <Image 
                      src={selectedDestination.photos[0]} 
                      alt={selectedDestination.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                </div>
              )}
              <div className="dashboard-detail-grid">
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Tên địa điểm</span>
                  <span className="dashboard-detail-value">{selectedDestination.name}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Loại</span>
                  <span className="dashboard-detail-value">{selectedDestination.type || "—"}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Tỉnh/Thành</span>
                  <span className="dashboard-detail-value">{selectedDestination.province || "—"}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Quận/Huyện</span>
                  <span className="dashboard-detail-value">{selectedDestination.district || "—"}</span>
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="dashboard-detail-label">Địa chỉ cụ thể</span>
                  <span className="dashboard-detail-value">{selectedDestination.specificAddress || "—"}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Tọa độ</span>
                  <span className="dashboard-detail-value">
                    {selectedDestination.latitude}, {selectedDestination.longitude}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Trạng thái</span>
                  <span className="dashboard-detail-value">
                    {selectedDestination.available ? (
                      <span style={{ color: "#10b981", fontWeight: 500 }}>Hoạt động</span>
                    ) : (
                      <span style={{ color: "#ef4444", fontWeight: 500 }}>Tạm ngưng</span>
                    )}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Đánh giá</span>
                  <span className="dashboard-detail-value">
                    {selectedDestination.rating || 0} ⭐ ({selectedDestination.userRatingsTotal} lượt)
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Lượt yêu thích</span>
                  <span className="dashboard-detail-value">{selectedDestination.favouriteTimes}</span>
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="dashboard-detail-label">Danh mục</span>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                    {selectedDestination.categories && selectedDestination.categories.length > 0 ? (
                      selectedDestination.categories.map((cat, idx) => (
                        <span key={idx} style={{ background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="dashboard-detail-value">—</span>
                    )}
                  </div>
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="dashboard-detail-label">Mô tả (Việt)</span>
                  <span className="dashboard-detail-value">{selectedDestination.descriptionViet || "—"}</span>
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="dashboard-detail-label">Mô tả (Anh)</span>
                  <span className="dashboard-detail-value">{selectedDestination.descriptionEng || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
