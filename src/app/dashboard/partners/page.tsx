"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCooperations, deleteCooperation, ApiError, type Cooperation } from "./data/partners.api";
import { logout } from "@/utils/token";

export default function PartnersPage() {
    const [cooperations, setCooperations] = useState<Cooperation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [q, setQ] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [page, setPage] = useState<number>(1);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
    const [selectedCooperation, setSelectedCooperation] = useState<Cooperation | null>(null);
    const pageSize = 7;
    const router = useRouter();

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

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await fetchCooperations();
                if (mounted) setCooperations(data);
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Không thể tải danh sách đối tác";
                const status = e instanceof ApiError ? e.status : null;
                setError(msg);
                setErrorStatus(status);
            } finally {
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const filtered = useMemo(() => {
        let result = cooperations;
        
        // Filter by type
        if (typeFilter !== "all") {
            result = result.filter(c => c.type === typeFilter);
        }
        
        // Filter by active status
        if (activeFilter !== "all") {
            result = result.filter(c => {
                if (activeFilter === "active") return c.active === true;
                if (activeFilter === "inactive") return c.active === false;
                return true;
            });
        }
        
        // Filter by search term
        const term = q.trim().toLowerCase();
        if (term) {
            result = result.filter(c =>
                [c.name, c.code, c.bossName, c.bossEmail, c.bossPhone, c.address, c.city, c.province]
                    .filter(Boolean)
                    .some(val => String(val).toLowerCase().includes(term))
            );
        }
        
        return result;
    }, [cooperations, q, typeFilter, activeFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getStatusBadgeClass = (active: boolean) => {
        const baseClass = "dashboard-badge";
        return `${baseClass} ${baseClass}--${active ? "active" : "inactive"}`;
    };

    const getStatusText = (active: boolean) => {
        return active ? "Hoạt động" : "Không hoạt động";
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return "—";
        }
    };

    const handleRetry = async () => {
        setLoading(true);
        setError(null);
        setErrorStatus(null);
        try {
            const data = await fetchCooperations();
            setCooperations(data);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể tải danh sách đối tác";
            const status = e instanceof ApiError ? e.status : null;
            setError(msg);
            setErrorStatus(status);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace("/");
    };

    const handleDeleteCooperation = async (id: number) => {
        const coop = cooperations.find(c => c.id === id);
        if (!confirm(`Bạn có chắc muốn xóa đối tác ${coop?.name}?`)) return;
        try {
            await deleteCooperation(id);
            setCooperations(prev => prev.filter(c => c.id !== id));
            setOpenDropdown(null);
            setDropdownPosition(null);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Không thể xóa đối tác");
        }
    };

    const handleViewDetail = (cooperation: Cooperation) => {
        setSelectedCooperation(cooperation);
        setOpenDropdown(null);
        setDropdownPosition(null);
    };

    const handleCloseModal = () => {
        setSelectedCooperation(null);
    };

    return (
        <div className="dashboard-view" onClick={() => { setOpenDropdown(null); setDropdownPosition(null); }}>
            {loading && (
                <div className="dashboard-loading">
                    <div className="dashboard-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <div className="dashboard-error">
                    <div className="dashboard-error-icon">⚠️</div>
                    <h2 className="dashboard-error-title">Lỗi</h2>
                    <p className="dashboard-error-message">{error}</p>
                    <div className="dashboard-error-actions">
                        {errorStatus === 401 ? (
                            <button onClick={handleLogout} className="dashboard-btn dashboard-btn--primary">Đăng nhập</button>
                        ) : (
                            <button onClick={handleRetry} className="dashboard-btn dashboard-btn--primary">Thử lại</button>
                        )}
                    </div>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="dashboard-toolbar">
                        <input
                            className="dashboard-search"
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            placeholder="🔍 Tìm kiếm theo tên, email, số điện thoại, địa chỉ..."
                        />
                        <select
                            className="dashboard-search"
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            style={{ maxWidth: "180px" }}
                        >
                            <option value="all">Tất cả loại hình</option>
                            <option value="hotel">Khách sạn</option>
                            <option value="restaurant">Nhà hàng</option>
                            <option value="delivery">Giao hàng</option>
                            <option value="bus">Xe buýt</option>
                            <option value="train">Tàu hỏa</option>
                            <option value="flight">Máy bay</option>
                        </select>
                        <select
                            className="dashboard-search"
                            value={activeFilter}
                            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
                            style={{ maxWidth: "180px" }}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                        </select>
                    </div>

                    <div className="dashboard-table-container">
                        <div className="dashboard-table-wrapper">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "80px" }}>ID</th>
                                        <th style={{ width: "200px" }}>Tên đối tác</th>
                                        <th style={{ width: "120px" }}>Loại hình</th>
                                        <th style={{ width: "130px" }}>Doanh thu</th>
                                        <th style={{ width: "120px" }}>Đánh giá</th>
                                        <th style={{ width: "120px" }}>Trạng thái</th>
                                        <th style={{ width: "130px" }}>Ngày tạo</th>
                                        <th style={{ width: "60px" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                                Không tìm thấy đối tác nào
                                            </td>
                                        </tr>
                                    ) : (
                                        pageData.map((coop) => {
                                            return (
                                                <tr key={coop.id}>
                                                    <td style={{ fontWeight: 600 }}>#{coop.id}</td>
                                                    <td style={{ fontWeight: 600 }}>{coop.name}</td>
                                                    <td style={{ textTransform: "capitalize" }}>{coop.type}</td>
                                                    <td style={{ color: "#059669", fontWeight: 600 }}>
                                                        {Number(coop.revenue).toLocaleString("vi-VN")} đ
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                            <span style={{ fontWeight: 600 }}>{coop.averageRating}</span>
                                                            <span>⭐</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={getStatusBadgeClass(coop.active)}>
                                                            {getStatusText(coop.active)}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                                        {formatDate(coop.createdAt)}
                                                    </td>
                                                    <td className="dashboard-action-cell">
                                                        <button
                                                            className="dashboard-action-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                const windowHeight = window.innerHeight;
                                                                const dropdownHeight = 120;
                                                                
                                                                const spaceBelow = windowHeight - rect.bottom;
                                                                const shouldShowAbove = spaceBelow < dropdownHeight;
                                                                
                                                                setDropdownPosition({
                                                                    top: shouldShowAbove ? rect.top - dropdownHeight : rect.bottom + 2,
                                                                    right: window.innerWidth - rect.right
                                                                });
                                                                setOpenDropdown(openDropdown === coop.id ? null : coop.id);
                                                            }}
                                                        >
                                                            ⋮
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="dashboard-pagination">
                            <div className="dashboard-pagination-info">
                                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} trong tổng số {filtered.length} đối tác
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
                </>
            )}

            {/* Dropdown menu - rendered outside table */}
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
                    {pageData.find(c => c.id === openDropdown) && (() => {
                        const coop = pageData.find(c => c.id === openDropdown)!;
                        return (
                            <>
                                <button
                                    className="dashboard-dropdown-item"
                                    onClick={() => handleViewDetail(coop)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Chi tiết
                                </button>
                                <button
                                    className="dashboard-dropdown-item dashboard-dropdown-item--danger"
                                    onClick={() => handleDeleteCooperation(coop.id)}
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

            {selectedCooperation && (
                <div className="dashboard-modal-overlay" onClick={handleCloseModal}>
                    <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dashboard-modal-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <h2 className="dashboard-modal-title">Chi tiết đối tác #{selectedCooperation.id}</h2>
                                <span className={getStatusBadgeClass(selectedCooperation.active)}>
                                    {getStatusText(selectedCooperation.active)}
                                </span>
                            </div>
                            <button className="dashboard-modal-close" onClick={handleCloseModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="dashboard-modal-body">
                            <div className="dashboard-detail-grid">
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Mã đối tác</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.code || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Tên đối tác</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.name}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Loại hình</span>
                                    <span className="dashboard-detail-value" style={{ textTransform: "capitalize" }}>{selectedCooperation.type}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Người phụ trách</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.bossName || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Email</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.bossEmail || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Số điện thoại</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.bossPhone || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Địa chỉ</span>
                                    <span className="dashboard-detail-value">
                                        {[selectedCooperation.address, selectedCooperation.district, selectedCooperation.city, selectedCooperation.province]
                                            .filter(Boolean).join(", ") || "—"}
                                    </span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Số đối tượng</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.numberOfObjects}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Số loại đối tượng</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.numberOfObjectTypes}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Lượt đặt</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.bookingTimes}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Doanh thu</span>
                                    <span className="dashboard-detail-value">{Number(selectedCooperation.revenue).toLocaleString("vi-VN")} đ</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Đánh giá TB</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.averageRating} ⭐</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Ngày ký HĐ</span>
                                    <span className="dashboard-detail-value">{formatDate(selectedCooperation.contractDate)}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Thời hạn HĐ</span>
                                    <span className="dashboard-detail-value">{selectedCooperation.contractTerm || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Ngày tạo</span>
                                    <span className="dashboard-detail-value">{formatDate(selectedCooperation.createdAt)}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Ngày cập nhật</span>
                                    <span className="dashboard-detail-value">{formatDate(selectedCooperation.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
