"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers, deleteUser, ApiError, type UserItem } from "./data/users.api";
import { logout } from "@/services/auth.service";

export default function UserPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [q, setQ] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const pageSize = 6;
    const router = useRouter();

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
        const term = q.trim().toLowerCase();
        if (!term) return users;
        return users.filter(u =>
            [u.username, u.fullName, u.email, u.phone]
                .filter(Boolean)
                .some(val => String(val).toLowerCase().includes(term))
        );
    }, [users, q]);

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
        <div className="user-view" onClick={() => setOpenDropdown(null)}>

            {loading && (
                <div className="user-loading">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <p style={{ marginTop: "1rem" }}>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && !loading && (
                <div className="user-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 1rem" }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Không thể tải dữ liệu</p>
                    <p style={{ fontSize: "0.9rem", color: "#64748b" }}>{error}</p>
                    <div className="user-error-actions">
                        {errorStatus === 401 ? (
                            <button onClick={handleLoginRedirect} className="user-btn user-btn--primary">Đăng nhập</button>
                        ) : (
                            <button onClick={handleRetry} className="user-btn user-btn--primary">Thử lại</button>
                        )}
                    </div>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="user-toolbar">
                        <input
                            className="user-search"
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            placeholder="🔍 Tìm kiếm theo username, họ tên, email, số điện thoại..."
                        />
                    </div>

                    <div className="user-table-container">
                        <div className="user-table-wrapper">
                            <table className="user-table">
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
                                                <td style={{ position: "relative" }}>
                                                    <button
                                                        className="user-action-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenDropdown(openDropdown === user.id ? null : user.id);
                                                        }}
                                                    >
                                                        ⋮
                                                    </button>
                                                    {openDropdown === user.id && (
                                                        <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                className="user-dropdown-item user-dropdown-item--danger"
                                                                onClick={() => handleDeleteUser(user.id)}
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

                        <div className="user-pagination">
                            <div className="user-pagination-info">
                                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} trong tổng số {filtered.length} người dùng
                            </div>
                            <div className="user-pagination-controls">
                                <button 
                                    className="user-pagination-btn"
                                    disabled={currentPage <= 1} 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    ← Trước
                                </button>
                                <span style={{ padding: "0 0.75rem", color: "#475569", fontWeight: 500 }}>
                                    {currentPage} / {totalPages}
                                </span>
                                <button 
                                    className="user-pagination-btn"
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
        </div>
    );
}

