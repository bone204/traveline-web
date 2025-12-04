"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import {
  fetchVehicleCatalog,
  fetchVehicleCatalogById,
  deleteVehicleCatalog,
  type VehicleCatalogItem,
} from "./data/vehicle-catalog.api";

export default function VehicleCatalogPage() {
  const [catalogs, setCatalogs] = useState<VehicleCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [selectedCatalog, setSelectedCatalog] = useState<VehicleCatalogItem | null>(null);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVehicleCatalog();
      setCatalogs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách danh mục xe");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục xe này?")) return;
    
    try {
      await deleteVehicleCatalog(id);
      setCatalogs(catalogs.filter((c) => c.id !== id));
      setOpenDropdown(null);
    } catch (err: unknown) {
      alert("Không thể xóa danh mục xe: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const catalog = await fetchVehicleCatalogById(id);
      setSelectedCatalog(catalog);
      setOpenDropdown(null);
    } catch (err: unknown) {
      alert("Không thể tải chi tiết: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
    }
  };

  const toggleDropdown = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openDropdown === id) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 120,
      });
      setOpenDropdown(id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setDropdownPosition(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const filtered = useMemo(() => {
    let result = catalogs;

    // Filter by type
    if (typeFilter && typeFilter !== "all") {
      result = result.filter((c) => c.type?.trim().toLowerCase() === typeFilter.toLowerCase());
    }

    // Search by brand, model, color, or type
    if (q) {
      const lower = q.toLowerCase();
      result = result.filter(
        (c) =>
          c.brand?.toLowerCase().includes(lower) ||
          c.model?.toLowerCase().includes(lower) ||
          c.color?.toLowerCase().includes(lower) ||
          c.type?.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [catalogs, q, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [q, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedCatalogs = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        Đang tải danh sách danh mục xe...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>⚠️ {error}</p>
        <div className="dashboard-error-actions">
          <button className="dashboard-btn dashboard-btn--primary" onClick={loadCatalogs}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <div className="dashboard-toolbar">
        <input
          type="text"
          placeholder="🔍 Tìm theo hãng, mẫu xe, màu sắc..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="dashboard-search"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="dashboard-search"
          style={{ maxWidth: "200px" }}
        >
          <option value="all">Tất cả loại xe</option>
          <option value="car">Ô tô</option>
          <option value="motorbike">Xe máy</option>
          <option value="bicycle">Xe đạp</option>
          <option value="truck">Xe tải</option>
          <option value="van">Xe van</option>
          <option value="suv">SUV</option>
        </select>
      </div>

      <div className="dashboard-table-container">
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>ID</th>
                <th style={{ width: "80px" }}>Loại</th>
                <th style={{ width: "140px" }}>Hãng</th>
                <th style={{ width: "140px" }}>Mẫu xe</th>
                <th style={{ width: "100px" }}>Màu sắc</th>
                <th style={{ width: "80px" }}>Số chỗ</th>
                <th style={{ width: "100px" }}>Nhiên liệu</th>
                <th style={{ width: "120px" }}>Hộp số</th>
                <th style={{ width: "140px" }}>Ngày tạo</th>
                <th style={{ width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedCatalogs.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                    Không tìm thấy danh mục xe nào
                  </td>
                </tr>
              ) : (
                paginatedCatalogs.map((catalog) => (
                  <tr key={catalog.id}>
                    <td>{catalog.id}</td>
                    <td>{catalog.type}</td>
                    <td>{catalog.brand}</td>
                    <td>{catalog.model}</td>
                    <td>{catalog.color}</td>
                    <td>{catalog.seatingCapacity}</td>
                    <td>{catalog.fuelType || "—"}</td>
                    <td>{catalog.transmission || "—"}</td>
                    <td>{new Date(catalog.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="dashboard-action-cell">
                      <button
                        className="dashboard-action-btn"
                        onClick={(e) => toggleDropdown(catalog.id, e)}
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

        {/* Dropdown menu */}
        {openDropdown !== null && dropdownPosition && (
          <div
            ref={dropdownRef}
            className="dashboard-dropdown-fixed"
            style={{
              position: "absolute",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              zIndex: 1000,
            }}
          >
            <button className="dashboard-dropdown-item" onClick={() => handleViewDetail(openDropdown)}>
              <span>👁️</span> Xem chi tiết
            </button>
            <button
              className="dashboard-dropdown-item dashboard-dropdown-item--danger"
              onClick={() => handleDelete(openDropdown)}
            >
              <span>🗑️</span> Xóa
            </button>
          </div>
        )}

        <div className="dashboard-pagination">
          <div className="dashboard-pagination-info">
            Hiển thị {Math.min((page - 1) * pageSize + 1, filtered.length)}–
            {Math.min(page * pageSize, filtered.length)} / {filtered.length} danh mục
          </div>
          <div className="dashboard-pagination-controls">
            <button
              className="dashboard-pagination-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Trước
            </button>
            <span style={{ padding: "0 1rem", color: "#64748b", fontSize: "0.9rem" }}>
              Trang {page} / {totalPages}
            </span>
            <button
              className="dashboard-pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCatalog && (
        <div className="dashboard-modal-overlay" onClick={() => setSelectedCatalog(null)}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">Chi tiết danh mục xe</h2>
              <button className="dashboard-modal-close" onClick={() => setSelectedCatalog(null)}>
                ✕
              </button>
            </div>
            <div className="dashboard-modal-body">
              {selectedCatalog.photo && (
                <div style={{ marginBottom: "1.5rem", textAlign: "center", position: "relative", width: "100%", height: "300px" }}>
                  <Image
                    src={selectedCatalog.photo}
                    alt={`${selectedCatalog.brand} ${selectedCatalog.model}`}
                    fill
                    style={{
                      borderRadius: "8px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              <div className="dashboard-detail-grid">
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">ID</span>
                  <span className="dashboard-detail-value">{selectedCatalog.id}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Loại xe</span>
                  <span className="dashboard-detail-value">{selectedCatalog.type}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Hãng</span>
                  <span className="dashboard-detail-value">{selectedCatalog.brand}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Mẫu xe</span>
                  <span className="dashboard-detail-value">{selectedCatalog.model}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Màu sắc</span>
                  <span className="dashboard-detail-value">{selectedCatalog.color}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Số chỗ ngồi</span>
                  <span className="dashboard-detail-value">{selectedCatalog.seatingCapacity}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Nhiên liệu</span>
                  <span className="dashboard-detail-value">{selectedCatalog.fuelType || "—"}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Tốc độ tối đa</span>
                  <span className="dashboard-detail-value">
                    {selectedCatalog.maxSpeed ? `${selectedCatalog.maxSpeed} km/h` : "—"}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Hộp số</span>
                  <span className="dashboard-detail-value">{selectedCatalog.transmission || "—"}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Ngày tạo</span>
                  <span className="dashboard-detail-value">
                    {new Date(selectedCatalog.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Ngày cập nhật</span>
                  <span className="dashboard-detail-value">
                    {new Date(selectedCatalog.updatedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
