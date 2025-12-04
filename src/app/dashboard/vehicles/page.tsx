"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchVehicles, deleteVehicle, approveVehicle, rejectVehicle, ApiError, VehicleApprovalStatus, VehicleAvailabilityStatus, type VehicleItem } from "./data/vehicles.api";
import { logout } from "@/utils/token";

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [q, setQ] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [page, setPage] = useState<number>(1);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null);
    const pageSize = 6;
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
                const data = await fetchVehicles();
                if (mounted) setVehicles(data);
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Không thể tải danh sách xe";
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
        let result = vehicles;
        
        // Filter by status (approval status or availability status)
        if (statusFilter !== "all") {
            result = result.filter(v => {
                // If approved, filter by availability
                if (v.status === VehicleApprovalStatus.APPROVED) {
                    return v.availability === statusFilter;
                }
                // Otherwise filter by approval status
                return v.status === statusFilter;
            });
        }
        
        // Filter by search term
        const term = q.trim().toLowerCase();
        if (term) {
            result = result.filter(v =>
                [v.licensePlate, v.description, v.contractId.toString()]
                    .filter(Boolean)
                    .some(val => String(val).toLowerCase().includes(term))
            );
        }
        
        return result;
    }, [vehicles, q, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getStatusBadgeClass = (status: VehicleApprovalStatus) => {
        const baseClass = "dashboard-badge";
        switch (status) {
            case VehicleApprovalStatus.APPROVED: return `${baseClass} ${baseClass}--success`;
            case VehicleApprovalStatus.PENDING: return `${baseClass} ${baseClass}--warning`;
            case VehicleApprovalStatus.REJECTED: return `${baseClass} ${baseClass}--danger`;
            case VehicleApprovalStatus.INACTIVE: return `${baseClass} ${baseClass}--neutral`;
            default: return `${baseClass} ${baseClass}--neutral`;
        }
    };

    const getStatusText = (status: VehicleApprovalStatus) => {
        switch (status) {
            case VehicleApprovalStatus.PENDING:
                return "Chờ duyệt";
            case VehicleApprovalStatus.APPROVED:
                return "Đã duyệt";
            case VehicleApprovalStatus.REJECTED:
                return "Từ chối";
            case VehicleApprovalStatus.INACTIVE:
                return "Không hoạt động";
            default:
                return status;
        }
    };

    const getAvailabilityBadgeClass = (availability: VehicleAvailabilityStatus) => {
        const baseClass = "dashboard-badge";
        switch (availability) {
            case VehicleAvailabilityStatus.AVAILABLE: return `${baseClass} ${baseClass}--success`;
            case VehicleAvailabilityStatus.RENTED: return `${baseClass} ${baseClass}--info`;
            case VehicleAvailabilityStatus.MAINTENANCE: return `${baseClass} ${baseClass}--warning`;
            default: return `${baseClass} ${baseClass}--neutral`;
        }
    };

    const getAvailabilityText = (availability: VehicleAvailabilityStatus) => {
        switch (availability) {
            case VehicleAvailabilityStatus.AVAILABLE:
                return "Sẵn sàng";
            case VehicleAvailabilityStatus.RENTED:
                return "Đang cho thuê";
            case VehicleAvailabilityStatus.MAINTENANCE:
                return "Bảo trì";
            default:
                return availability;
        }
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(price);
    };

    const handleRetry = async () => {
        setLoading(true);
        setError(null);
        setErrorStatus(null);
        try {
            const data = await fetchVehicles();
            setVehicles(data);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể tải danh sách xe";
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

    const handleDeleteVehicle = async (licensePlate: string) => {
        if (!confirm(`Bạn có chắc muốn xóa xe ${licensePlate}?`)) return;
        try {
            await deleteVehicle(licensePlate);
            setVehicles(prev => prev.filter(v => v.licensePlate !== licensePlate));
            setOpenDropdown(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể xóa xe";
            alert(msg);
        }
    };

    const handleApproveVehicle = async (licensePlate: string) => {
        if (!confirm(`Bạn có chắc muốn duyệt xe ${licensePlate}?`)) return;
        try {
            await approveVehicle(licensePlate);
            setVehicles(prev => prev.map(v =>
                v.licensePlate === licensePlate ? { ...v, status: VehicleApprovalStatus.APPROVED } : v
            ));
            setOpenDropdown(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể duyệt xe";
            alert(msg);
        }
    };

    const handleRejectVehicle = async (licensePlate: string) => {
        const reason = prompt("Nhập lý do từ chối:");
        if (!reason?.trim()) return;
        try {
            await rejectVehicle(licensePlate, reason);
            setVehicles(prev => prev.map(v =>
                v.licensePlate === licensePlate ? { ...v, status: VehicleApprovalStatus.REJECTED, rejectedReason: reason } : v
            ));
            setOpenDropdown(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể từ chối xe";
            alert(msg);
        }
    };

    const handleViewDetail = (vehicle: VehicleItem) => {
        setSelectedVehicle(vehicle);
        setOpenDropdown(null);
    };

    const handleCloseModal = () => {
        setSelectedVehicle(null);
    };

    if (loading) {
        return (
            <div className="dashboard-view">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                    </svg>
                    <p style={{ color: "#64748b", fontSize: "1rem" }}>Đang tải danh sách xe...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-view">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "1rem" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 1rem" }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p style={{ color: "#dc2626", fontSize: "1.125rem", fontWeight: 600 }}>Lỗi: {error}</p>
                    {errorStatus === 401 ? (
                        <button
                            onClick={handleLogout}
                            style={{
                                background: "#3b82f6",
                                color: "#fff",
                                padding: "0.5rem 1.5rem",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 500
                            }}
                        >
                            Đăng nhập lại
                        </button>
                    ) : (
                        <button
                            onClick={handleRetry}
                            style={{
                                background: "#3b82f6",
                                color: "#fff",
                                padding: "0.5rem 1.5rem",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 500
                            }}
                        >
                            Thử lại
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-view" onClick={() => setOpenDropdown(null)}>

            {loading && (
                <div className="dashboard-loading">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <p style={{ marginTop: "1rem" }}>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && !loading && (
                <div className="dashboard-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 1rem" }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Không thể tải dữ liệu</p>
                    <p style={{ fontSize: "0.9rem", color: "#64748b" }}>{error}</p>
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
                    placeholder="🔍 Tìm kiếm theo biển số, mô tả, ID hợp đồng..."
                />
                <select
                    className="dashboard-search"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ maxWidth: "200px" }}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <optgroup label="Trạng thái duyệt">
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                        <option value="INACTIVE">Không hoạt động</option>
                    </optgroup>
                    <optgroup label="Tình trạng (xe đã duyệt)">
                        <option value="AVAILABLE">Sẵn sàng</option>
                        <option value="RENTED">Đang cho thuê</option>
                        <option value="MAINTENANCE">Bảo trì</option>
                    </optgroup>
                </select>
            </div>                    <div className="dashboard-table-container">
                        <div className="dashboard-table-wrapper">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "110px" }}>Biển số</th>
                                        <th style={{ width: "90px" }}>Hợp đồng</th>
                                        <th style={{ width: "100px" }}>Giá/giờ</th>
                                        <th style={{ width: "100px" }}>Giá/ngày</th>
                                        {pageData.some(v => v.status === VehicleApprovalStatus.APPROVED) && (
                                            <>
                                                <th style={{ width: "90px" }}>Lượt thuê</th>
                                                <th style={{ width: "90px" }}>Đánh giá</th>
                                                <th style={{ width: "120px" }}>Tình trạng</th>
                                                <th style={{ width: "130px" }}>Ngày cập nhật</th>
                                            </>
                                        )}
                                        {pageData.some(v => v.status !== VehicleApprovalStatus.APPROVED) && (
                                            <>
                                                <th style={{ width: "120px" }}>Trạng thái</th>
                                                <th style={{ width: "130px" }}>Ngày tạo</th>
                                                <th style={{ width: "130px" }}>Ngày cập nhật</th>
                                            </>
                                        )}
                                        <th style={{ width: "60px" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                                Không tìm thấy xe nào
                                            </td>
                                        </tr>
                                    ) : (
                                        pageData.map((vehicle) => {
                                            return (
                                                <tr key={vehicle.licensePlate}>
                                                    <td style={{ fontWeight: 600 }}>{vehicle.licensePlate}</td>
                                                    <td style={{ fontWeight: 600, color: "#64748b" }}>#{vehicle.contractId}</td>
                                                    <td>{formatPrice(vehicle.pricePerHour)}</td>
                                                    <td>{formatPrice(vehicle.pricePerDay)}</td>
                                                    {vehicle.status === VehicleApprovalStatus.APPROVED ? (
                                                        <>
                                                            <td style={{ textAlign: "center" }}>{vehicle.totalRentals}</td>
                                                            <td style={{ textAlign: "center" }}>{vehicle.averageRating ? vehicle.averageRating.toFixed(1) : "—"}</td>
                                                            <td>
                                                                <span className={getAvailabilityBadgeClass(vehicle.availability)}>
                                                                    {getAvailabilityText(vehicle.availability)}
                                                                </span>
                                                            </td>
                                                            <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                                                {formatDate(vehicle.updatedAt)}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                <span className={getStatusBadgeClass(vehicle.status)}>
                                                                    {getStatusText(vehicle.status)}
                                                                </span>
                                                            </td>
                                                            <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                                                {formatDate(vehicle.createdAt)}
                                                            </td>
                                                            <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                                                {formatDate(vehicle.updatedAt)}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="dashboard-action-cell">
                                                        <button
                                                            className="dashboard-action-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                const windowHeight = window.innerHeight;
                                                                const dropdownHeight = 180; // approximate height
                                                                
                                                                // Check if dropdown would overflow bottom
                                                                const spaceBelow = windowHeight - rect.bottom;
                                                                const shouldShowAbove = spaceBelow < dropdownHeight;
                                                                
                                                                setDropdownPosition({
                                                                    top: shouldShowAbove ? rect.top - dropdownHeight : rect.bottom + 2,
                                                                    right: window.innerWidth - rect.right
                                                                });
                                                                setOpenDropdown(openDropdown === vehicle.licensePlate ? null : vehicle.licensePlate);
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
                                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} trong tổng số {filtered.length} xe
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
                    {pageData.find(v => v.licensePlate === openDropdown) && (() => {
                        const vehicle = pageData.find(v => v.licensePlate === openDropdown)!;
                        return (
                            <>
                                <button
                                    className="dashboard-dropdown-item"
                                    onClick={() => handleViewDetail(vehicle)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Chi tiết
                                </button>
                                {vehicle.status === VehicleApprovalStatus.PENDING && (
                                    <>
                                        <button
                                            className="dashboard-dropdown-item dashboard-dropdown-item--success"
                                            onClick={() => handleApproveVehicle(vehicle.licensePlate)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Duyệt
                                        </button>
                                        <button
                                            className="dashboard-dropdown-item dashboard-dropdown-item--warning"
                                            onClick={() => handleRejectVehicle(vehicle.licensePlate)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                            Từ chối
                                        </button>
                                    </>
                                )}
                                <button
                                    className="dashboard-dropdown-item dashboard-dropdown-item--danger"
                                    onClick={() => handleDeleteVehicle(vehicle.licensePlate)}
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

            {selectedVehicle && (
                <div className="dashboard-modal-overlay" onClick={handleCloseModal}>
                    <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dashboard-modal-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <h2 className="dashboard-modal-title">Chi tiết xe {selectedVehicle.licensePlate}</h2>
                                <span className={getStatusBadgeClass(selectedVehicle.status)}>
                                    {getStatusText(selectedVehicle.status)}
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
                            <div className="dashboard-detail-section">
                                <h3 className="dashboard-detail-section-title">Thông tin cơ bản</h3>
                                <div className="dashboard-detail-grid">
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Biển số xe:</span>
                                        <span className="dashboard-detail-value">{selectedVehicle.licensePlate}</span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Hợp đồng:</span>
                                        <span className="dashboard-detail-value">#{selectedVehicle.contractId}</span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Giá thuê giờ:</span>
                                        <span className="dashboard-detail-value">{formatPrice(selectedVehicle.pricePerHour)}</span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Giá thuê ngày:</span>
                                        <span className="dashboard-detail-value">{formatPrice(selectedVehicle.pricePerDay)}</span>
                                    </div>
                                    {selectedVehicle.description && (
                                        <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                                            <span className="dashboard-detail-label">Mô tả:</span>
                                            <span className="dashboard-detail-value">{selectedVehicle.description}</span>
                                        </div>
                                    )}
                                    {selectedVehicle.requirements && (
                                        <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                                            <span className="dashboard-detail-label">Yêu cầu:</span>
                                            <span className="dashboard-detail-value">{selectedVehicle.requirements}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="dashboard-detail-section">
                                <h3 className="dashboard-detail-section-title">Trạng thái & Thống kê</h3>
                                <div className="dashboard-detail-grid">
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Tình trạng:</span>
                                        <span className={getAvailabilityBadgeClass(selectedVehicle.availability)}>
                                            {getAvailabilityText(selectedVehicle.availability)}
                                        </span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Tổng lượt thuê:</span>
                                        <span className="dashboard-detail-value">{selectedVehicle.totalRentals}</span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Đánh giá TB:</span>
                                        <span className="dashboard-detail-value">{selectedVehicle.averageRating ? selectedVehicle.averageRating.toFixed(1) : "—"}</span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Ngày tạo:</span>
                                        <span className="dashboard-detail-value">{formatDate(selectedVehicle.createdAt)}</span>
                                    </div>
                                    {selectedVehicle.updatedAt && (
                                        <div className="dashboard-detail-item">
                                            <span className="dashboard-detail-label">Cập nhật lúc:</span>
                                            <span className="dashboard-detail-value">{formatDate(selectedVehicle.updatedAt)}</span>
                                        </div>
                                    )}
                                    {selectedVehicle.rejectedReason && (
                                        <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                                            <span className="dashboard-detail-label">Lý do từ chối:</span>
                                            <span className="dashboard-detail-value" style={{ color: "#dc2626" }}>{selectedVehicle.rejectedReason}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
