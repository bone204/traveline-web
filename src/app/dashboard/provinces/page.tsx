"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { provincesApi, type Province } from "@/api/provinces.api";
import { 
  useGetDashboardDestinationsQuery, 
  useDeleteDestinationMutation,
  useAddDestinationMutation,
  useUpdateDestinationMutation,
  type Destination 
} from "../destinations/destinations.api";

export default function ProvincesPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    provincesApi.findAll().then((data) => {
      setProvinces(data);
      setIsLoadingProvinces(false);
    });
  }, []);

  // Destination mutations
  const [deleteDestination] = useDeleteDestinationMutation();
  const [addDestination, { isLoading: isAdding }] = useAddDestinationMutation();
  const [updateDestination, { isLoading: isUpdating }] = useUpdateDestinationMutation();

  // Fetch destinations only when a province is selected
  const { data: destinations = [], isLoading: isLoadingDestinations } = useGetDashboardDestinationsQuery(
    selectedProvince ? { province: selectedProvince.name } : undefined,
    { skip: !selectedProvince }
  );

  // Modals state
  const [currentDest, setCurrentDest] = useState<Destination | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create/Edit form state
  const [destForm, setDestForm] = useState({
    name: "",
    type: "tourist_attraction",
    district: "",
    specificAddress: "",
    latitude: 0,
    longitude: 0,
    descriptionViet: "",
    descriptionEng: "",
    categories: [] as string[]
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const filteredProvinces = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return provinces;
    return provinces.filter(p => p.name.toLowerCase().includes(term));
  }, [provinces, searchQuery]);

  const filteredDestinations = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return destinations;
    return destinations.filter(d => d.name.toLowerCase().includes(term) || d.district?.toLowerCase().includes(term));
  }, [destinations, searchQuery]);

  // Handlers
  const handleBack = () => {
    setSelectedProvince(null);
    setSearchQuery("");
  };

  const openCreateModal = () => {
    setDestForm({
      name: "", type: "tourist_attraction", district: "", specificAddress: "",
      latitude: 10.762622, longitude: 106.660172, descriptionViet: "", descriptionEng: "", categories: []
    });
    setPhotos([]);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (dest: Destination) => {
    setCurrentDest(dest);
    setDestForm({
      name: dest.name,
      type: dest.type || "tourist_attraction",
      district: dest.district || "",
      specificAddress: dest.specificAddress || "",
      latitude: dest.latitude,
      longitude: dest.longitude,
      descriptionViet: dest.descriptionViet || "",
      descriptionEng: dest.descriptionEng || "",
      categories: dest.categories || []
    });
    setPhotos([]);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa địa điểm này?")) return;
    try {
      await deleteDestination(id).unwrap();
      alert("Xóa thành công!");
    } catch (err) {
      alert("Không thể xóa địa điểm");
    }
  };

  const handleSubmit = async (e: React.FormEvent, mode: "CREATE" | "EDIT") => {
    e.preventDefault();
    if (!destForm.name) {
      alert("Vui lòng điền tên địa điểm");
      return;
    }

    const formData = new FormData();
    formData.append("name", destForm.name);
    formData.append("type", destForm.type);
    formData.append("province", selectedProvince?.name || "");
    formData.append("district", destForm.district);
    formData.append("specificAddress", destForm.specificAddress);
    formData.append("latitude", destForm.latitude.toString());
    formData.append("longitude", destForm.longitude.toString());
    formData.append("descriptionViet", destForm.descriptionViet);
    formData.append("descriptionEng", destForm.descriptionEng);
    formData.append("categories", destForm.categories.join(","));
    
    photos.forEach(file => {
      formData.append("photos", file);
    });

    try {
      if (mode === "CREATE") {
        await addDestination(formData).unwrap();
        setIsCreateModalOpen(false);
      } else {
        await updateDestination({ id: currentDest!.id, body: formData }).unwrap();
        setIsEditModalOpen(false);
      }
      alert(`${mode === "CREATE" ? "Thêm" : "Cập nhật"} thành công!`);
    } catch (err: any) {
      alert(err?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  if (isLoadingProvinces) return <div className="p-12 text-center text-slate-500 font-medium">Đang tải dữ liệu...</div>;

  return (
    <div className="dashboard-view" style={{ overflowY: "auto", maxHeight: "calc(100vh - 40px)", paddingBottom: "3rem" }}>
      {/* Search & Actions Header */}
      <div className="dashboard-header" style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2.5rem", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10, padding: "1rem 0" }}>
        {selectedProvince && (
          <button 
            onClick={handleBack}
            className="dashboard-btn"
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
             </svg>
             Quay lại
          </button>
        )}
        
        <div style={{ flex: 1, position: "relative" }}>
          <input
            className="dashboard-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={selectedProvince ? `🔍 Tìm kiếm địa điểm tại ${selectedProvince.name}...` : "🔍 Tìm kiếm tỉnh thành..."}
            style={{ width: "100%", paddingLeft: "3rem" }}
          />
        </div>

        {selectedProvince && (
          <button 
            onClick={openCreateModal}
            className="dashboard-btn dashboard-btn--primary"
          >
            + Thêm địa điểm
          </button>
        )}
      </div>

      {/* Grid Content */}
      <div style={{ padding: "0 1rem" }}>
        {!selectedProvince ? (
            // Province Grid
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.75rem" }}>
            {filteredProvinces.map((province, index) => (
                <div
                key={province.id || province.code || index}
                onClick={() => setSelectedProvince(province)}
                className="bg-white"
                style={{ 
                    backgroundColor: "#fff", 
                    padding: "1.5rem", 
                    borderRadius: "24px", 
                    border: "1px solid #e2e8f0", 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)";
                    e.currentTarget.style.borderColor = "#4f46e5";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                }}
                >
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#f8fafc", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                    {province.avatarUrl ? (
                    <img
                        src={province.avatarUrl}
                        alt={province.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 700 }}>
                        {province.code}
                    </div>
                    )}
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800, color: "#1e293b", fontSize: "1.1rem", marginBottom: "0.25rem" }}>{province.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Code: {province.code}</div>
                </div>
                </div>
            ))}
            </div>
        ) : (
            // Destination Grid (Circular Style)
            <div>
            {isLoadingDestinations ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>Đang tải danh sách địa điểm...</div>
            ) : filteredDestinations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📍</div>
                    <p>Chưa có địa điểm nào tại {selectedProvince.name}</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.75rem" }}>
                {filteredDestinations.map((dest) => (
                    <div
                    key={dest.id}
                    className="bg-white"
                    style={{ 
                        backgroundColor: "#fff", 
                        padding: "1.5rem", 
                        borderRadius: "24px", 
                        border: "1px solid #e2e8f0", 
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1rem",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#4f46e5";
                        const actions = e.currentTarget.querySelector('.dest-actions') as HTMLElement;
                        if (actions) actions.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        const actions = e.currentTarget.querySelector('.dest-actions') as HTMLElement;
                        if (actions) actions.style.opacity = "0";
                    }}
                    >
                    <div 
                        style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#f8fafc", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", cursor: "pointer" }}
                        onClick={() => { setCurrentDest(dest); setIsDetailModalOpen(true); }}
                    >
                        {dest.photos && dest.photos.length > 0 ? (
                        <img
                            src={dest.photos[0]}
                            alt={dest.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: "2rem" }}>
                            🏞️
                        </div>
                        )}
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 800, color: "#1e293b", fontSize: "1rem", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" }}>{dest.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{dest.district || "—"}</div>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                            <span>★</span> {dest.rating || 0}
                        </div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                            <span>❤️</span> {dest.favouriteTimes || 0}
                        </div>
                        </div>
                    </div>

                    {/* Hover Actions */}
                    <div 
                        className="dest-actions"
                        style={{ 
                        position: "absolute", bottom: "0.75rem", left: 0, right: 0, 
                        display: "flex", justifyContent: "center", gap: "0.5rem", 
                        opacity: 0, transition: "opacity 0.2s ease", padding: "0 1rem" 
                        }}
                    >
                        <button 
                            onClick={() => openEditModal(dest)}
                            className="dashboard-btn"
                            style={{ padding: "0.35rem", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", color: "#475569", border: "none", cursor: "pointer" }}
                            title="Chỉnh sửa"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => handleDelete(dest.id)}
                            className="dashboard-btn"
                            style={{ padding: "0.35rem", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fee2e2", color: "#ef4444", border: "none", cursor: "pointer" }}
                            title="Xóa"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="dashboard-modal-overlay" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">{isCreateModalOpen ? "Thêm địa điểm mới" : "Chỉnh sửa địa điểm"}</h2>
              <button className="dashboard-modal-close" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit(e, isCreateModalOpen ? "CREATE" : "EDIT")} className="dashboard-modal-body">
              <div className="dashboard-detail-grid">
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label className="dashboard-detail-label">Tên địa điểm *</label>
                  <input 
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    value={destForm.name}
                    onChange={e => setDestForm({...destForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Loại</label>
                  <select 
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    value={destForm.type}
                    onChange={e => setDestForm({...destForm, type: e.target.value})}
                  >
                    <option value="tourist_attraction">Điểm tham quan</option>
                    <option value="restaurant">Nhà hàng</option>
                    <option value="hotel">Khách sạn</option>
                    <option value="park">Công viên</option>
                    <option value="museum">Bảo tàng</option>
                  </select>
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Tỉnh/Thành</label>
                  <input 
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem", background: "#f1f5f9" }}
                    value={selectedProvince?.name || ""}
                    disabled
                  />
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Quận/Huyện</label>
                  <input 
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    value={destForm.district}
                    onChange={e => setDestForm({...destForm, district: e.target.value})}
                  />
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Địa chỉ cụ thể</label>
                  <input 
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    value={destForm.specificAddress}
                    onChange={e => setDestForm({...destForm, specificAddress: e.target.value})}
                  />
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Vĩ độ</label>
                  <input 
                    type="number" step="any"
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    value={destForm.latitude}
                    onChange={e => setDestForm({...destForm, latitude: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Kinh độ</label>
                  <input 
                    type="number" step="any"
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem" }}
                    value={destForm.longitude}
                    onChange={e => setDestForm({...destForm, longitude: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label className="dashboard-detail-label">Mô tả (Tiếng Việt)</label>
                  <textarea 
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem", minHeight: "80px", padding: "0.75rem" }}
                    value={destForm.descriptionViet}
                    onChange={e => setDestForm({...destForm, descriptionViet: e.target.value})}
                  />
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label className="dashboard-detail-label">Mô tả (Tiếng Anh)</label>
                  <textarea 
                    className="dashboard-search" 
                    style={{ width: "100%", marginTop: "0.25rem", minHeight: "80px", padding: "0.75rem" }}
                    value={destForm.descriptionEng}
                    onChange={e => setDestForm({...destForm, descriptionEng: e.target.value})}
                  />
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label className="dashboard-detail-label">Ảnh địa điểm {isCreateModalOpen ? "(Ít nhất 1) *" : ""}</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={e => setPhotos(Array.from(e.target.files || []))}
                    style={{ marginTop: "0.5rem" }}
                  />
                  {photos.length > 0 && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#4f46e5", fontWeight: 600 }}>
                      Đã chọn {photos.length} ảnh mới
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button 
                  type="button" 
                  className="dashboard-btn"
                  onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="dashboard-btn dashboard-btn--primary"
                  disabled={isAdding || isUpdating}
                >
                  {isAdding || isUpdating ? "Đang lưu..." : (isCreateModalOpen ? "Thêm địa điểm" : "Lưu thay đổi")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && currentDest && (
        <div className="dashboard-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">Chi tiết: {currentDest.name}</h2>
              <button className="dashboard-modal-close" onClick={() => setIsDetailModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="dashboard-modal-body">
              {currentDest.photos && currentDest.photos.length > 0 && (
                <div style={{ marginBottom: "1.5rem", width: "100%", height: "240px", position: "relative", borderRadius: "16px", overflow: "hidden" }}>
                  <img 
                    src={currentDest.photos[0]} 
                    alt={currentDest.name} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
              )}
              
              <div className="dashboard-detail-grid">
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Tên</label>
                  <p className="dashboard-detail-value" style={{ fontWeight: 700 }}>{currentDest.name}</p>
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Loại</label>
                  <p className="dashboard-detail-value">{currentDest.type}</p>
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Địa chỉ</label>
                  <p className="dashboard-detail-value">{currentDest.specificAddress || currentDest.district || currentDest.province}</p>
                </div>
                <div className="dashboard-detail-item">
                  <label className="dashboard-detail-label">Đánh giá</label>
                  <p className="dashboard-detail-value" style={{ color: "#fbbf24", fontWeight: 700 }}>★ {currentDest.rating || 0}</p>
                </div>
                <div className="dashboard-detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label className="dashboard-detail-label">Mô tả</label>
                  <p className="dashboard-detail-value" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "12px", lineHeight: "1.6" }}>
                    {currentDest.descriptionViet || "Không có mô tả."}
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                 <button 
                  className="dashboard-btn dashboard-btn--primary"
                  onClick={() => setIsDetailModalOpen(false)}
                 >
                  Đóng
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
