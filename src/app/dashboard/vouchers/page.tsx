"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  fetchVouchers,
  fetchVoucherById,
  deleteVoucher,
  createVoucher,
  type VoucherItem,
  type CreateVoucherPayload,
} from "./data/vouchers.api";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    value: "",
    maxDiscountValue: "",
    minOrderValue: "",
    maxUsage: "",
    startsAt: "",
    expiresAt: "",
    active: true,
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVouchers();
      setVouchers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa voucher này?")) return;

    try {
      await deleteVoucher(id);
      setVouchers(vouchers.filter((v) => v.id !== id));
      setOpenDropdown(null);
    } catch (err: unknown) {
      alert("Không thể xóa voucher: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const voucher = await fetchVoucherById(id);
      setSelectedVoucher(voucher);
      setOpenDropdown(null);
    } catch (err: unknown) {
      alert("Không thể tải chi tiết: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: CreateVoucherPayload = {
        code: formData.code,
        discountType: formData.discountType,
        value: Number(formData.value),
        maxUsage: Number(formData.maxUsage) || 0,
        active: formData.active,
      };

      if (formData.description) payload.description = formData.description;
      if (formData.maxDiscountValue) payload.maxDiscountValue = Number(formData.maxDiscountValue);
      if (formData.minOrderValue) payload.minOrderValue = Number(formData.minOrderValue);
      if (formData.startsAt) payload.startsAt = new Date(formData.startsAt).toISOString();
      if (formData.expiresAt) payload.expiresAt = new Date(formData.expiresAt).toISOString();

      await createVoucher(payload);

      alert("✅ Tạo voucher thành công!");
      setShowCreateModal(false);
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        value: "",
        maxDiscountValue: "",
        minOrderValue: "",
        maxUsage: "",
        startsAt: "",
        expiresAt: "",
        active: true,
      });
      loadVouchers();
    } catch (err: unknown) {
      alert("❌ " + (err instanceof Error ? err.message : "Lỗi không xác định"));
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
    let result = vouchers;

    // Filter by active status
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      result = result.filter((v) => v.active === isActive);
    }

    // Search by code or description
    if (q) {
      const lower = q.toLowerCase();
      result = result.filter(
        (v) =>
          v.code?.toLowerCase().includes(lower) ||
          v.description?.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [vouchers, q, activeFilter]);

  useEffect(() => {
    setPage(1);
  }, [q, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedVouchers = filtered.slice((page - 1) * pageSize, page * pageSize);

  const formatPrice = (value: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        Đang tải danh sách voucher...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>⚠️ {error}</p>
        <div className="dashboard-error-actions">
          <button className="dashboard-btn dashboard-btn--primary" onClick={loadVouchers}>
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
          placeholder="🔍 Tìm theo mã, mô tả..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="dashboard-search"
        />
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="dashboard-search"
          style={{ maxWidth: "200px" }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <button className="dashboard-btn dashboard-btn--primary" onClick={() => setShowCreateModal(true)}>
          + Thêm voucher
        </button>
      </div>

      <div className="dashboard-table-container">
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>ID</th>
                <th style={{ width: "120px" }}>Mã</th>
                <th style={{ width: "200px" }}>Mô tả</th>
                <th style={{ width: "100px" }}>Loại</th>
                <th style={{ width: "120px" }}>Giá trị</th>
                <th style={{ width: "100px" }}>Đã dùng</th>
                <th style={{ width: "120px" }}>Hết hạn</th>
                <th style={{ width: "100px" }}>Trạng thái</th>
                <th style={{ width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                    Không tìm thấy voucher nào
                  </td>
                </tr>
              ) : (
                paginatedVouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td>{voucher.id}</td>
                    <td style={{ fontWeight: 600 }}>{voucher.code}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {voucher.description || "—"}
                    </td>
                    <td>{voucher.discountType === "percentage" ? "Phần trăm" : "Cố định"}</td>
                    <td>
                      {voucher.discountType === "percentage"
                        ? `${voucher.value}%`
                        : formatPrice(voucher.value)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {voucher.usedCount} / {voucher.maxUsage}
                    </td>
                    <td>{formatDate(voucher.expiresAt)}</td>
                    <td>
                      <span
                        className={`dashboard-badge dashboard-badge--${
                          voucher.active ? "active" : "inactive"
                        }`}
                      >
                        {voucher.active ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td className="dashboard-action-cell">
                      <button
                        className="dashboard-action-btn"
                        onClick={(e) => toggleDropdown(voucher.id, e)}
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
            {Math.min(page * pageSize, filtered.length)} / {filtered.length} voucher
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
      {selectedVoucher && (
        <div className="dashboard-modal-overlay" onClick={() => setSelectedVoucher(null)}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">Chi tiết voucher</h2>
              <button className="dashboard-modal-close" onClick={() => setSelectedVoucher(null)}>
                ✕
              </button>
            </div>
            <div className="dashboard-modal-body">
              <div className="dashboard-detail-grid">
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">ID</span>
                  <span className="dashboard-detail-value">{selectedVoucher.id}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Mã voucher</span>
                  <span className="dashboard-detail-value">{selectedVoucher.code}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Loại giảm giá</span>
                  <span className="dashboard-detail-value">
                    {selectedVoucher.discountType === "percentage" ? "Phần trăm" : "Cố định"}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Giá trị</span>
                  <span className="dashboard-detail-value">
                    {selectedVoucher.discountType === "percentage"
                      ? `${selectedVoucher.value}%`
                      : formatPrice(selectedVoucher.value)}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Giảm tối đa</span>
                  <span className="dashboard-detail-value">
                    {selectedVoucher.maxDiscountValue
                      ? formatPrice(selectedVoucher.maxDiscountValue)
                      : "—"}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Giá trị đơn tối thiểu</span>
                  <span className="dashboard-detail-value">
                    {selectedVoucher.minOrderValue ? formatPrice(selectedVoucher.minOrderValue) : "—"}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Đã sử dụng</span>
                  <span className="dashboard-detail-value">
                    {selectedVoucher.usedCount} / {selectedVoucher.maxUsage}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Ngày bắt đầu</span>
                  <span className="dashboard-detail-value">{formatDate(selectedVoucher.startsAt)}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Ngày hết hạn</span>
                  <span className="dashboard-detail-value">{formatDate(selectedVoucher.expiresAt)}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Trạng thái</span>
                  <span className="dashboard-detail-value">
                    {selectedVoucher.active ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="dashboard-detail-label">Mô tả</span>
                  <span className="dashboard-detail-value">{selectedVoucher.description || "—"}</span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Ngày tạo</span>
                  <span className="dashboard-detail-value">
                    {new Date(selectedVoucher.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="dashboard-detail-item">
                  <span className="dashboard-detail-label">Ngày cập nhật</span>
                  <span className="dashboard-detail-value">
                    {new Date(selectedVoucher.updatedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">Tạo voucher mới</h2>
              <button className="dashboard-modal-close" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>
            <div className="dashboard-modal-body">
              <form onSubmit={handleCreateVoucher} className="dashboard-form">
                <div className="dashboard-form-grid">
                  <div className="dashboard-form-group">
                    <label className="dashboard-form-label">
                      Mã voucher <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="dashboard-form-input"
                      placeholder="VD: SUMMER2024"
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label className="dashboard-form-label">
                      Loại giảm giá <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })
                      }
                      className="dashboard-form-input"
                    >
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed">Cố định (VNĐ)</option>
                    </select>
                  </div>

                  <div className="dashboard-form-group">
                    <label className="dashboard-form-label">
                      Giá trị {formData.discountType === "percentage" ? "(%)" : "(VNĐ)"}{" "}
                      <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step={formData.discountType === "percentage" ? "1" : "1000"}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="dashboard-form-input"
                      placeholder={formData.discountType === "percentage" ? "VD: 10" : "VD: 50000"}
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label className="dashboard-form-label">Giảm tối đa (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.maxDiscountValue}
                      onChange={(e) => setFormData({ ...formData, maxDiscountValue: e.target.value })}
                      className="dashboard-form-input"
                      placeholder="VD: 100000"
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label className="dashboard-form-label">Giá trị đơn tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                      className="dashboard-form-input"
                      placeholder="VD: 200000"
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label className="dashboard-form-label">
                      Số lần sử dụng tối đa <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.maxUsage}
                      onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                      className="dashboard-form-input"
                      placeholder="VD: 100"
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label className="dashboard-form-label">Ngày bắt đầu</label>
                    <input
                      type="datetime-local"
                      value={formData.startsAt}
                      onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                      className="dashboard-form-input"
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label className="dashboard-form-label">Ngày hết hạn</label>
                    <input
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="dashboard-form-input"
                    />
                  </div>

                  <div className="dashboard-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="dashboard-form-label">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="dashboard-form-textarea"
                      placeholder="Mô tả về voucher..."
                      rows={3}
                    />
                  </div>

                  <div className="dashboard-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="dashboard-form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      <span>Kích hoạt ngay</span>
                    </label>
                  </div>
                </div>

                <div className="dashboard-form-actions">
                  <button
                    type="button"
                    className="dashboard-btn"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="dashboard-btn dashboard-btn--primary">
                    Tạo voucher
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
