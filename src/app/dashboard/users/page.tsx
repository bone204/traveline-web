"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers, deleteUser, ApiError, type UserItem } from "./data/users.api";
import { logout } from "@/utils/token";

export default function UserPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [q, setQ] = useState<string>("");
    const [tierFilter, setTierFilter] = useState<string>("all");
    const [page, setPage] = useState<number>(1);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
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
                const data = await fetchUsers();
                if (mounted) setUsers(data);
             
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Không thể tải danh sách người dùng";
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
        let result = users;
        
        // Filter by tier
        if (tierFilter !== "all") {
            result = result.filter(u => u.userTier === tierFilter);
        }
        
        // Filter by search term
        const term = q.trim().toLowerCase();
        if (term) {
            result = result.filter(u =>
                [u.username, u.fullName, u.email, u.phone]
                    .filter(Boolean)
                    .some(val => String(val).toLowerCase().includes(term))
            );
        }
        
        return result;
    }, [users, q, tierFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            const data = await fetchUsers();
            setUsers(data);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể tải danh sách người dùng";
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

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
        
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            setOpenDropdown(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Không thể xóa người dùng";
            alert(msg);
        }
    };

    return (
        <div className="dashboard-view" onClick={() => setOpenDropdown(null)}>

            {loading && (
                <div className="dashboard-loading">
                    <div className="dashboard-spinner"></div>
                    <p style={{ marginTop: "1rem" }}>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && !loading && (
                <div className="dashboard-error">
                    <div className="dashboard-error-icon">⚠️</div>
                    <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Không thể tải dữ liệu</p>
                    <p className="dashboard-error-message">{error}</p>
                    <div className="dashboard-error-actions">
                        {errorStatus === 401 ? (
                            <button onClick={handleLoginRedirect} className="dashboard-btn dashboard-btn--primary">Đăng nhập</button>
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
                            placeholder="🔍 Tìm kiếm theo username, họ tên, email, số điện thoại..."
                        />
                        <select
                            className="dashboard-search"
                            value={tierFilter}
                            onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
                            style={{ maxWidth: "200px" }}
                        >
                            <option value="all">Tất cả hạng</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="vip">VIP</option>
                            <option value="dong">Đồng</option>
                            <option value="kim_cuong">Kim Cương</option>
                            <option value="bac">Bạc</option>
                            <option value="vang">Vàng</option>
                        </select>
                    </div>

                    <div className="dashboard-table-container">
                        <div className="dashboard-table-wrapper">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "60px" }}>ID</th>
                                        <th style={{ width: "150px" }}>Tên người dùng</th>
                                        <th style={{ width: "200px" }}>Họ và tên</th>
                                        <th style={{ width: "200px" }}>Email</th>
                                        <th style={{ width: "130px" }}>Số điện thoại</th>
                                        <th style={{ width: "120px" }}>Hạng</th>
                                        <th style={{ width: "150px" }}>Ngày tạo</th>
                                        <th style={{ width: "60px" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                                Không tìm thấy người dùng nào
                                            </td>
                                        </tr>
                                    ) : (
                                        pageData.map((user) => (
                                            <tr key={user.id}>
                                                <td style={{ fontWeight: 600, color: "#64748b" }}>#{user.id}</td>
                                                <td style={{ fontWeight: 600 }}>{user.username}</td>
                                                <td>{user.fullName || "—"}</td>
                                                <td style={{ color: "#64748b" }}>{user.email || "—"}</td>
                                                <td style={{ color: "#64748b" }}>{user.phone || "—"}</td>
                                                <td style={{ color: "#64748b" }}>{user.userTier || "—"}</td>
                                                <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                                    {formatDate(user.createdAt)}
                                                </td>
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
                                                            setOpenDropdown(openDropdown === user.id ? null : user.id);
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
                                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} trong tổng số {filtered.length} người dùng
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
                    {pageData.find(u => u.id === openDropdown) && (() => {
                        const user = pageData.find(u => u.id === openDropdown)!;
                        return (
                            <button
                                className="dashboard-dropdown-item dashboard-dropdown-item--danger"
                                onClick={() => handleDeleteUser(user.id)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Xóa
                            </button>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

