"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
    useGetPartnersQuery, 
    useDeletePartnerMutation, 
    useApprovePartnerMutation,
    useUploadContractMutation,
    type Partner 
} from "./partners.api";
import { logout } from "@/utils/token";
import { toast } from "react-hot-toast";

export default function PartnersPage() {
    const { data: partners = [], isLoading, error, refetch } = useGetPartnersQuery();
    const [deletePartner] = useDeletePartnerMutation();
    const [approvePartner, { isLoading: isApproving }] = useApprovePartnerMutation();
    const [uploadContract, { isLoading: isUploading }] = useUploadContractMutation();

    const [commissionType, setCommissionType] = useState<string>("PERCENT");
    const [commissionValue, setCommissionValue] = useState<string>("10");
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [expiryDate, setExpiryDate] = useState<string>("");

    const [q, setQ] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [page, setPage] = useState<number>(1);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
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

    const filtered = useMemo(() => {
        let result = partners;
        
        // Filter by type
        if (typeFilter !== "all") {
            result = result.filter((c: Partner) => c.type === typeFilter);
        }
        
        // Filter by status
        if (statusFilter !== "all") {
            result = result.filter((c: Partner) => c.status === statusFilter);
        }
        
        // Filter by search term
        const term = q.trim().toLowerCase();
        if (term) {
            result = result.filter((c: Partner) =>
                [c.name, c.code, c.bossName, c.bossEmail, c.bossPhone, c.address, c.city, c.province]
                    .filter(Boolean)
                    .some(val => String(val).toLowerCase().includes(term))
            );
        }
        
        return result;
    }, [partners, q, typeFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getStatusBadgeClass = (status: string) => {
        const baseClass = "dashboard-badge";
        const statusMap: Record<string, string> = {
            PENDING: "warning",
            APPROVED: "info",
            ACTIVE: "success",
            REJECTED: "danger",
            STOPPED: "neutral"
        };
        return `${baseClass} ${baseClass}--${statusMap[status] || "neutral"}`;
    };

    const getStatusText = (status: string) => {
        const textMap: Record<string, string> = {
            PENDING: "Chờ duyệt",
            APPROVED: "Đã duyệt",
            ACTIVE: "Hoạt động",
            REJECTED: "Từ chối",
            STOPPED: "Tạm dừng"
        };
        return textMap[status] || status;
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

    const handleLogout = () => {
        logout();
        router.replace("/");
    };

    const handleDeletePartner = async (id: number) => {
        const partner = partners.find(c => c.id === id);
        if (!confirm(`Bạn có chắc muốn xóa đối tác ${partner?.name}?`)) return;
        try {
            await deletePartner(id).unwrap();
            setOpenDropdown(null);
            setDropdownPosition(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể xóa đối tác";
            alert(msg);
        }
    };

    const handleViewDetail = (partner: Partner) => {
        setSelectedPartner(partner);
        setOpenDropdown(null);
        setDropdownPosition(null);
    };

    const handleCloseModal = () => {
        setSelectedPartner(null);
        setContractFile(null);
        setExpiryDate("");
    };

    useEffect(() => {
        if (selectedPartner) {
            if (selectedPartner.commissionType) setCommissionType(selectedPartner.commissionType);
            if (selectedPartner.commissionValue) setCommissionValue(selectedPartner.commissionValue);
        }
    }, [selectedPartner]);

    const handleApprove = async () => {
        if (!selectedPartner) return;
        try {
            await approvePartner({
                id: selectedPartner.id,
                commissionType,
                commissionValue
            }).unwrap();
            toast.success("Đã phê duyệt đối tác!");
        } catch (e: any) {
            toast.error(e?.data?.message || "Không thể phê duyệt");
        }
    };

    const handleUploadContract = async () => {
        if (!selectedPartner || !contractFile) {
            toast.error("Vui lòng chọn file hợp đồng");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("file", contractFile);
            if (expiryDate) formData.append("expiryDate", expiryDate);
            
            await uploadContract({
                id: selectedPartner.id,
                data: formData
            }).unwrap();
            toast.success("Đã kích hoạt hợp tác và lưu hợp đồng!");
            handleCloseModal();
        } catch (e: any) {
            toast.error(e?.data?.message || "Không thể tải lên hợp đồng");
        }
    };

    return (
        <div className="dashboard-view" onClick={() => { setOpenDropdown(null); setDropdownPosition(null); }}>
            {isLoading && (
                <div className="dashboard-loading">
                    <div className="dashboard-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="dashboard-error">
                    <div className="dashboard-error-icon">⚠️</div>
                    <h2 className="dashboard-error-title">Lỗi</h2>
                    <p className="dashboard-error-message">Không thể tải dữ liệu</p>
                    <div className="dashboard-error-actions">
                        {error && 'status' in error && error.status === 401 ? (
                            <button onClick={handleLogout} className="dashboard-btn dashboard-btn--primary">Đăng nhập</button>
                        ) : (
                            <button onClick={() => refetch()} className="dashboard-btn dashboard-btn--primary">Thử lại</button>
                        )}
                    </div>
                </div>
            )}

            {!isLoading && !error && (
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
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            style={{ maxWidth: "180px" }}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="APPROVED">Đã duyệt</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="REJECTED">Từ chối</option>
                            <option value="STOPPED">Tạm dừng</option>
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
                                        pageData.map((partner: Partner) => {
                                            return (
                                                <tr key={partner.id}>
                                                    <td style={{ fontWeight: 600 }}>#{partner.id}</td>
                                                    <td style={{ fontWeight: 600 }}>{partner.name}</td>
                                                    <td style={{ textTransform: "capitalize" }}>{partner.type}</td>
                                                    <td style={{ color: "#059669", fontWeight: 600 }}>
                                                        {Number(partner.revenue).toLocaleString("vi-VN")} đ
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                            <span style={{ fontWeight: 600 }}>{partner.averageRating}</span>
                                                            <span>⭐</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={getStatusBadgeClass(partner.status)}>
                                                            {getStatusText(partner.status)}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                                        {formatDate(partner.createdAt)}
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
                                                                setOpenDropdown(openDropdown === partner.id ? null : partner.id);
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
                    {pageData.find((c: Partner) => c.id === openDropdown) && (() => {
                        const partner = pageData.find((c: Partner) => c.id === openDropdown)!;
                        return (
                            <>
                                <button
                                    className="dashboard-dropdown-item"
                                    onClick={() => handleViewDetail(partner)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Chi tiết
                                </button>
                                <button
                                    className="dashboard-dropdown-item dashboard-dropdown-item--danger"
                                    onClick={() => handleDeletePartner(partner.id)}
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

            {selectedPartner && (
                <div className="dashboard-modal-overlay" onClick={handleCloseModal}>
                    <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dashboard-modal-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <h2 className="dashboard-modal-title">Chi tiết đối tác #{selectedPartner.id}</h2>
                                <span className={getStatusBadgeClass(selectedPartner.status)}>
                                    {getStatusText(selectedPartner.status)}
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
                                    <span className="dashboard-detail-label">Logo thương hiệu</span>
                                    <span className="dashboard-detail-value">
                                        {selectedPartner.brandLogo ? (
                                            <img src={selectedPartner.brandLogo} alt="Logo" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }} />
                                        ) : "—"}
                                    </span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Mã đối tác</span>
                                    <span className="dashboard-detail-value">{selectedPartner.code || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Tên đối tác</span>
                                    <span className="dashboard-detail-value">{selectedPartner.name}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Loại hình</span>
                                    <span className="dashboard-detail-value" style={{ textTransform: "capitalize" }}>{selectedPartner.type}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Người đại diện</span>
                                    <span className="dashboard-detail-value">{selectedPartner.representativeName || selectedPartner.bossName || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Email</span>
                                    <span className="dashboard-detail-value">{selectedPartner.representativeEmail || selectedPartner.bossEmail || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Số điện thoại</span>
                                    <span className="dashboard-detail-value">{selectedPartner.representativePhone || selectedPartner.bossPhone || "—"}</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Địa chỉ</span>
                                    <span className="dashboard-detail-value">
                                        {[selectedPartner.address, selectedPartner.districtId, selectedPartner.provinceId]
                                            .filter(Boolean).join(", ") || [selectedPartner.address, selectedPartner.district, selectedPartner.city, selectedPartner.province].filter(Boolean).join(", ") || "—"}
                                    </span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Doanh thu</span>
                                    <span className="dashboard-detail-value">{Number(selectedPartner.revenue).toLocaleString("vi-VN")} đ</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Đánh giá TB</span>
                                    <span className="dashboard-detail-value">{selectedPartner.averageRating} ⭐</span>
                                </div>
                                <div className="dashboard-detail-item">
                                    <span className="dashboard-detail-label">Ngày tạo</span>
                                    <span className="dashboard-detail-value">{formatDate(selectedPartner.createdAt)}</span>
                                </div>
                            </div>

                            <div className="dashboard-detail-section mt-4">
                                <h3 className="dashboard-detail-section-title">Hồ sơ pháp lý & Tài liệu</h3>
                                <div className="dashboard-detail-grid">
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Giấy phép kinh doanh</span>
                                        {selectedPartner.businessLicense ? (
                                            <a href={selectedPartner.businessLicense} target="_blank" rel="noreferrer" className="dashboard-detail-value" style={{ color: "#2563eb", textDecoration: "underline" }}>Xem tài liệu</a>
                                        ) : <span className="dashboard-detail-value">—</span>}
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">CCCD đại diện</span>
                                        {selectedPartner.representativeIdCard ? (
                                            <a href={selectedPartner.representativeIdCard} target="_blank" rel="noreferrer" className="dashboard-detail-value" style={{ color: "#2563eb", textDecoration: "underline" }}>Xem tài liệu</a>
                                        ) : <span className="dashboard-detail-value">—</span>}
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Mã số thuế</span>
                                        <span className="dashboard-detail-value">{selectedPartner.taxId || "—"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-detail-section mt-4">
                                <h3 className="dashboard-detail-section-title">Thanh toán & Đối soát</h3>
                                <div className="dashboard-detail-grid">
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Ngân hàng</span>
                                        <span className="dashboard-detail-value">{selectedPartner.bankName || "—"}</span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Số tài khoản</span>
                                        <span className="dashboard-detail-value">{selectedPartner.bankAccountNumber || "—"}</span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">Chủ tài khoản</span>
                                        <span className="dashboard-detail-value">{selectedPartner.bankAccountName || "—"}</span>
                                    </div>
                                    <div className="dashboard-detail-item">
                                        <span className="dashboard-detail-label">QR Thanh toán</span>
                                        {selectedPartner.paymentQr ? (
                                            <a href={selectedPartner.paymentQr} target="_blank" rel="noreferrer" className="dashboard-detail-value" style={{ color: "#2563eb", textDecoration: "underline" }}>Xem mã QR</a>
                                        ) : <span className="dashboard-detail-value">—</span>}
                                    </div>
                                </div>
                            </div>

                            <hr style={{ margin: "2rem 0", borderColor: "#e2e8f0" }} />

                            {selectedPartner.status === "PENDING" && (
                                <div className="dashboard-detail-section">
                                    <h3 className="dashboard-detail-section-title">Duyệt hồ sơ đối tác</h3>
                                    <div className="dashboard-form">
                                        <div className="dashboard-form-grid">
                                            <div className="dashboard-form-group">
                                                <label className="dashboard-form-label">Loại hoa hồng</label>
                                                <select 
                                                    className="dashboard-form-input"
                                                    value={commissionType}
                                                    onChange={(e) => setCommissionType(e.target.value)}
                                                >
                                                    <option value="PERCENT">Phần trăm (%)</option>
                                                    <option value="FIXED">Cố định (đ)</option>
                                                </select>
                                            </div>
                                            <div className="dashboard-form-group">
                                                <label className="dashboard-form-label">Giá trị</label>
                                                <input 
                                                    className="dashboard-form-input"
                                                    type="text"
                                                    value={commissionValue}
                                                    onChange={(e) => setCommissionValue(e.target.value)}
                                                    placeholder="VD: 10 hoặc 50000"
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                            <button 
                                                className="dashboard-btn dashboard-btn--primary"
                                                onClick={handleApprove}
                                                disabled={isApproving}
                                            >
                                                {isApproving ? "Đang xử lý..." : "Phê duyệt đối tác"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedPartner.status === "APPROVED" && (
                                <div className="dashboard-detail-section">
                                    <h3 className="dashboard-detail-section-title">Kích hoạt & Tải lên hợp đồng</h3>
                                    <div className="dashboard-form">
                                        <div className="dashboard-form-grid">
                                            <div className="dashboard-form-group">
                                                <label className="dashboard-form-label">File hợp đồng (PDF/Image)</label>
                                                <input 
                                                    type="file" 
                                                    className="dashboard-form-input"
                                                    onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                                                />
                                            </div>
                                            <div className="dashboard-form-group">
                                                <label className="dashboard-form-label">Ngày hết hạn (tùy chọn)</label>
                                                <input 
                                                    type="date" 
                                                    className="dashboard-form-input"
                                                    value={expiryDate}
                                                    onChange={(e) => setExpiryDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                                            <button 
                                                className="dashboard-btn dashboard-btn--primary"
                                                onClick={handleUploadContract}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? "Đang tải lên..." : "Kích hoạt & Lưu hợp đồng"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedPartner.status === "ACTIVE" && selectedPartner.currentContractUrl && (
                                <div className="dashboard-detail-section">
                                    <h3 className="dashboard-detail-section-title">Thông tin hợp tác hiện tại</h3>
                                    <div className="dashboard-detail-grid">
                                        <div className="dashboard-detail-item">
                                            <span className="dashboard-detail-label">Hoa hồng</span>
                                            <span className="dashboard-detail-value">
                                                {selectedPartner.commissionType === "PERCENT" 
                                                    ? `${selectedPartner.commissionValue}%` 
                                                    : `${Number(selectedPartner.commissionValue).toLocaleString("vi-VN")} đ`}
                                            </span>
                                        </div>
                                        <div className="dashboard-detail-item">
                                            <span className="dashboard-detail-label">Hợp đồng</span>
                                            <a 
                                                href={selectedPartner.currentContractUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="dashboard-detail-value"
                                                style={{ color: "#2563eb", textDecoration: "underline" }}
                                            >
                                                Xem hợp đồng đã ký
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
