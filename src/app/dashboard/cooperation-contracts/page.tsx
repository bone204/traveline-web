"use client";

import { useMemo, useState } from "react";
import { useGetCooperationContractsQuery, type CooperationContract } from "./cooperation-contracts.api";
import { toast } from "react-hot-toast";

export default function CooperationContractsPage() {
    const { data: contracts = [], isLoading, error, refetch } = useGetCooperationContractsQuery();

    const [q, setQ] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const pageSize = 10;

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return contracts;
        
        return contracts.filter((c: CooperationContract) =>
            [c.cooperation.name, c.terms]
                .filter(Boolean)
                .some(val => String(val).toLowerCase().includes(term))
        );
    }, [contracts, q]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("vi-VN");
        } catch {
            return "—";
        }
    };

    return (
        <div className="dashboard-view">
            <h1 className="dashboard-title">Hợp đồng đối tác</h1>
            <p className="dashboard-subtitle">Danh sách tất cả các hợp đồng đã ký kết với đối tác</p>

            <div className="dashboard-toolbar mt-4">
                <input
                    className="dashboard-search"
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    placeholder="🔍 Tìm kiếm theo tên đối tác, điều khoản..."
                />
            </div>

            {isLoading && (
                <div className="dashboard-loading">
                    <div className="dashboard-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <div className="dashboard-error">
                    <p>Không thể tải dữ liệu hợp đồng</p>
                    <button onClick={() => refetch()} className="dashboard-btn dashboard-btn--primary">Thử lại</button>
                </div>
            )}

            {!isLoading && !error && (
                <div className="dashboard-table-container mt-3">
                    <div className="dashboard-table-wrapper">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>ID</th>
                                    <th style={{ width: "250px" }}>Đối tác</th>
                                    <th style={{ width: "150px" }}>Loại hình</th>
                                    <th style={{ width: "150px" }}>Ngày ký</th>
                                    <th style={{ width: "150px" }}>Hết hạn</th>
                                    <th style={{ width: "100px" }}>Trạng thái</th>
                                    <th style={{ width: "100px" }}>Tài liệu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                            Không tìm thấy hợp đồng nào
                                        </td>
                                    </tr>
                                ) : (
                                    pageData.map((contract: CooperationContract) => (
                                        <tr key={contract.id}>
                                            <td style={{ fontWeight: 600 }}>#{contract.id}</td>
                                            <td style={{ fontWeight: 600 }}>{contract.cooperation.name}</td>
                                            <td style={{ textTransform: "capitalize" }}>{contract.cooperation.type}</td>
                                            <td>{formatDate(contract.signedDate)}</td>
                                            <td>{formatDate(contract.expiryDate)}</td>
                                            <td>
                                                <span className={`dashboard-badge dashboard-badge--${contract.active ? "success" : "neutral"}`}>
                                                    {contract.active ? "Hiệu lực" : "Hết hạn"}
                                                </span>
                                            </td>
                                            <td>
                                                <a 
                                                    href={contract.contractUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    style={{ color: "#2563eb", textDecoration: "underline" }}
                                                >
                                                    Xem
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="dashboard-pagination">
                        <div className="dashboard-pagination-info">
                            Hiển thị {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} hợp đồng
                        </div>
                        <div className="dashboard-pagination-controls">
                            <button
                                className="dashboard-pagination-btn"
                                disabled={currentPage <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                ← Trước
                            </button>
                            <span style={{ padding: "0 0.75rem" }}>{currentPage} / {totalPages}</span>
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
            )}
        </div>
    );
}
