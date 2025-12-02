"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchContracts, deleteContract, approveContract, rejectContract, ApiError, ContractStatus, type ContractItem } from "./data/contracts.api";
import { logout } from "@/services/auth.service";

export default function ContractsPage() {
    const [contracts, setContracts] = useState<ContractItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [q, setQ] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
    const pageSize = 6;
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await fetchContracts();
                if (mounted) setContracts(data);
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Không thể tải danh sách hợp đồng";
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
        const term = q.trim().toLowerCase();
        if (!term) return contracts;
        return contracts.filter(c =>
            [c.fullName, c.email, c.phoneNumber, c.businessName, c.citizenId]
                .filter(Boolean)
                .some(val => String(val).toLowerCase().includes(term))
        );
    }, [contracts, q]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getStatusBadgeClass = (status: ContractStatus) => {
        const baseClass = "contract-status-badge";
        return `${baseClass} ${baseClass}--${status}`;
    };

    const getStatusText = (status: ContractStatus) => {
        switch (status) {
            case ContractStatus.PENDING:
                return "Chờ duyệt";
            case ContractStatus.APPROVED:
                return "Đã duyệt";
            case ContractStatus.REJECTED:
                return "Từ chối";
            case ContractStatus.SUSPENDED:
                return "Tạm ngưng";
            default:
                return status;
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

    const handleRetry = async () => {
        setLoading(true);
        setError(null);
        setErrorStatus(null);
        try {
            const data = await fetchContracts();
            setContracts(data);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể tải danh sách hợp đồng";
            const status = e instanceof ApiError ? e.status : null;
            setError(msg);
            setErrorStatus(status);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        logout();
        router.replace("/");
    };

    const handleViewDetail = (contract: ContractItem) => {
        setSelectedContract(contract);
        setOpenDropdown(null);
    };

    const handleCloseModal = () => {
        setSelectedContract(null);
    };

    const handleDeleteContract = async (contractId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa hợp đồng này?")) return;

        try {
            await deleteContract(contractId);
            setContracts(contracts.filter(c => c.id !== contractId));
            setOpenDropdown(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể xóa hợp đồng";
            alert(msg);
        }
    };

    const handleApproveContract = async (contractId: number) => {
        if (!confirm("Bạn có chắc chắn muốn duyệt hợp đồng này?")) return;

        try {
            await approveContract(contractId);
            setContracts(contracts.map(c => 
                c.id === contractId ? { ...c, status: ContractStatus.APPROVED } : c
            ));
            setOpenDropdown(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể duyệt hợp đồng";
            alert(msg);
        }
    };

    const handleRejectContract = async (contractId: number) => {
        const reason = prompt("Nhập lý do từ chối:");
        if (!reason || !reason.trim()) return;

        try {
            await rejectContract(contractId, reason);
            setContracts(contracts.map(c => 
                c.id === contractId ? { ...c, status: ContractStatus.REJECTED } : c
            ));
            setOpenDropdown(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể từ chối hợp đồng";
            alert(msg);
        }
    };

    return (
        <div className="contract-view" onClick={() => setOpenDropdown(null)}>

            {loading && (
                <div className="contract-loading">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <p style={{ marginTop: "1rem" }}>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && !loading && (
                <div className="contract-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 1rem" }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Không thể tải dữ liệu</p>
                    <p style={{ fontSize: "0.9rem", color: "#64748b" }}>{error}</p>
                    <div className="contract-error-actions">
                        {errorStatus === 401 ? (
                            <button onClick={handleLoginRedirect} className="contract-btn contract-btn--primary">Đăng nhập</button>
                        ) : (
                            <button onClick={handleRetry} className="contract-btn contract-btn--primary">Thử lại</button>
                        )}
                    </div>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="contract-toolbar">
                        <input
                            className="contract-search"
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            placeholder="🔍 Tìm kiếm theo tên, email, SĐT, CCCD, tên doanh nghiệp..."
                        />
                    </div>

                    <div className="contract-table-container">
                        <div className="contract-table-wrapper">
                            <table className="contract-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "60px" }}>ID</th>
                                        <th style={{ width: "180px" }}>Người đăng ký</th>
                                        <th style={{ width: "200px" }}>Email</th>
                                        <th style={{ width: "130px" }}>SĐT</th>
                                        <th style={{ width: "100px" }}>Loại hình</th>
                                        <th style={{ width: "130px" }}>Trạng thái</th>
                                        <th style={{ width: "80px" }}>Số xe</th>
                                        <th style={{ width: "150px" }}>Ngày tạo</th>
                                        <th style={{ width: "60px" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                                Không tìm thấy hợp đồng nào
                                            </td>
                                        </tr>
                                    ) : (
                                        pageData.map((contract) => (
                                            <tr key={contract.id}>
                                                <td style={{ fontWeight: 600, color: "#64748b" }}>#{contract.id}</td>
                                                <td style={{ fontWeight: 600 }}>{contract.fullName || "—"}</td>
                                                <td style={{ color: "#64748b" }}>{contract.email || "—"}</td>
                                                <td style={{ color: "#64748b" }}>{contract.phoneNumber || "—"}</td>
                                                <td>{contract.businessType === "personal" ? "Cá nhân" : contract.businessName || "Doanh nghiệp"}</td>
                                                <td>
                                                    <span className={getStatusBadgeClass(contract.status)}>
                                                        {getStatusText(contract.status)}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>{contract.totalVehicles}</td>
                                                <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                                    {formatDate(contract.createdAt)}
                                                </td>
                                                <td style={{ position: "relative" }}>
                                                    <button
                                                        className="contract-action-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenDropdown(openDropdown === contract.id ? null : contract.id);
                                                        }}
                                                    >
                                                        ⋮
                                                    </button>
                                                    {openDropdown === contract.id && (
                                                        <div className="contract-dropdown" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                className="contract-dropdown-item"
                                                                onClick={() => handleViewDetail(contract)}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                                    <circle cx="12" cy="12" r="3" />
                                                                </svg>
                                                                Chi tiết
                                                            </button>
                                                            {contract.status === ContractStatus.PENDING && (
                                                                <>
                                                                    <button
                                                                        className="contract-dropdown-item contract-dropdown-item--success"
                                                                        onClick={() => handleApproveContract(contract.id)}
                                                                    >
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <polyline points="20 6 9 17 4 12" />
                                                                        </svg>
                                                                        Duyệt
                                                                    </button>
                                                                    <button
                                                                        className="contract-dropdown-item contract-dropdown-item--warning"
                                                                        onClick={() => handleRejectContract(contract.id)}
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
                                                                className="contract-dropdown-item contract-dropdown-item--danger"
                                                                onClick={() => handleDeleteContract(contract.id)}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="3 6 5 6 21 6" />
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                </svg>
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="contract-pagination">
                            <div className="contract-pagination-info">
                                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} trong tổng số {filtered.length} hợp đồng
                            </div>
                            <div className="contract-pagination-controls">
                                <button
                                    className="contract-pagination-btn"
                                    disabled={currentPage <= 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    ← Trước
                                </button>
                                <span style={{ padding: "0 0.75rem", color: "#475569", fontWeight: 500 }}>
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    className="contract-pagination-btn"
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

            {selectedContract && (
                <div className="contract-modal-overlay" onClick={handleCloseModal}>
                    <div className="contract-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="contract-modal-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <h2 className="contract-modal-title">Chi tiết hợp đồng #{selectedContract.id}</h2>
                                <span className={getStatusBadgeClass(selectedContract.status)}>
                                    {getStatusText(selectedContract.status)}
                                </span>
                            </div>
                            <button className="contract-modal-close" onClick={handleCloseModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="contract-modal-body">
                            <div className="contract-detail-section">
                                <h3 className="contract-detail-section-title">Thông tin người đăng ký</h3>
                                <div className="contract-detail-grid">
                                    <div className="contract-detail-item">
                                        <span className="contract-detail-label">Họ và tên:</span>
                                        <span className="contract-detail-value">{selectedContract.fullName || "—"}</span>
                                    </div>
                                    <div className="contract-detail-item">
                                        <span className="contract-detail-label">Email:</span>
                                        <span className="contract-detail-value">{selectedContract.email || "—"}</span>
                                    </div>
                                    <div className="contract-detail-item">
                                        <span className="contract-detail-label">Số điện thoại:</span>
                                        <span className="contract-detail-value">{selectedContract.phoneNumber || "—"}</span>
                                    </div>
                                    <div className="contract-detail-item">
                                        <span className="contract-detail-label">CCCD:</span>
                                        <span className="contract-detail-value">{selectedContract.citizenId || "—"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="contract-detail-section">
                                <h3 className="contract-detail-section-title">Thông tin doanh nghiệp</h3>
                                <div className="contract-detail-grid">
                                    <div className="contract-detail-item">
                                        <span className="contract-detail-label">Loại hình:</span>
                                        <span className="contract-detail-value">
                                            {selectedContract.businessType === "personal" ? "Cá nhân" : "Doanh nghiệp"}
                                        </span>
                                    </div>
                                    {selectedContract.businessName && (
                                        <div className="contract-detail-item">
                                            <span className="contract-detail-label">Tên doanh nghiệp:</span>
                                            <span className="contract-detail-value">{selectedContract.businessName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="contract-detail-section">
                                <h3 className="contract-detail-section-title">Thông tin hợp đồng</h3>
                                <div className="contract-detail-grid">
                                    <div className="contract-detail-item">
                                        <span className="contract-detail-label">Ngày tạo:</span>
                                        <span className="contract-detail-value">{formatDate(selectedContract.createdAt)}</span>
                                    </div>
                                    {selectedContract.statusUpdatedAt && (
                                        <div className="contract-detail-item">
                                            <span className="contract-detail-label">Cập nhật lúc:</span>
                                            <span className="contract-detail-value">{formatDate(selectedContract.statusUpdatedAt)}</span>
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


