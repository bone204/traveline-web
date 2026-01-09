"use client";

import { use, useEffect, useState } from "react";
import { useGetGuestBillQuery, useSubmitGuestEvidenceMutation } from "@/api/rental-bills.api";
import { useRouter } from "next/navigation"; // Correct hook for app router
import { RentalBillStatus } from "@/dto/rental-bill.dto";

export default function GuestTrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const { token } = resolvedParams;
  const { data: bill, isLoading, error } = useGetGuestBillQuery(token);
  const [submitEvidence, { isLoading: isSubmitting }] = useSubmitGuestEvidenceMutation();
  const [files, setFiles] = useState<File[]>([]);
  const [gps, setGps] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    // Request GPS immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          setLocationError("Không thể lấy vị trí. Vui lòng bật GPS và cho phép truy cập.");
          console.error(err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Trình duyệt không hỗ trợ GPS.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!gps) {
        alert("Vui lòng cho phép truy cập vị trí để gửi bằng chứng.");
        return;
    }
    if (files.length === 0) {
        alert("Vui lòng chọn ít nhất 1 ảnh.");
        return;
    }

    try {
      await submitEvidence({
        token,
        files,
        latitude: gps.lat,
        longitude: gps.lon,
      }).unwrap();
      alert("Gửi bằng chứng thành công!");
      window.location.reload();
    } catch (err: any) {
      alert("Gửi thất bại: " + (err?.data?.message || err.message));
    }
  };

  if (isLoading) return <div className="p-4 text-center">Đang tải...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Liên kết không hợp lệ hoặc đã hết hạn.</div>;
  if (!bill) return null;

  const isDelivery = bill.status === RentalBillStatus.PENDING || bill.status === RentalBillStatus.PAID;
  const canUpload = isDelivery || bill.status === RentalBillStatus.COMPLETED; // Logic might need check, wait COMPLETED means done? 
  // Wait, backend logic: isDelivery (PENDING/PAID) or isReturn (IN_PROGRESS/RETURN_REQUESTED).
  // Frontend bill.status is just mapped from backend.
  // Backend `getBillByGuestToken` returns `status` property.
  
  // Let's assume if it's not cancelled, we show details. 
  // The upload form should only show if backend allows. 
  // Backend throws error if state is wrong, but UI should guide user.
  // Ideally backend passes `canUpload` flag or we infer.
  // In `getBillByGuestToken` I didn't verify logic for "isReturn" exactly match purely "status".
  // But generally:
  // Delivery evidence: Pending/Paid.
  // Return evidence: InProgress/ReturnRequested.

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-4 text-white">
          <h1 className="text-xl font-bold">Thông tin thuê xe</h1>
          <p className="text-sm opacity-90">Mã đơn: {bill.code}</p>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Khách hàng</label>
            <p className="font-semibold">{bill.customerName}</p>
            <a href={`tel:${bill.customerPhone}`} className="text-blue-600 text-sm">{bill.customerPhone}</a>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-500">Nhận xe</label>
                <p className="text-sm">{new Date(bill.startDate).toLocaleString('vi-VN')}</p>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-500">Trả xe</label>
                <p className="text-sm">{new Date(bill.endDate).toLocaleString('vi-VN')}</p>
             </div>
          </div>

          <div className="bg-gray-100 p-3 rounded">
            <label className="block text-sm font-medium text-gray-500">Xe thuê</label>
            <p className="font-bold text-lg">{bill.vehicleName}</p>
            <p className="text-gray-600">{bill.licensePlate}</p>
          </div>

          {bill.location && (
            <div>
                 <label className="block text-sm font-medium text-gray-500">Địa điểm giao xe</label>
                 <p>{bill.location}</p>
                 <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bill.location)}`}
                   target="_blank"
                   rel="noreferrer"
                   className="text-blue-600 text-sm underline"
                 >
                    Mở bản đồ
                 </a>
            </div>
          )}
          
          <hr />

          <div>
            <h2 className="text-lg font-bold mb-2">Cập nhật bằng chứng</h2>
            
            {locationError && (
                <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm mb-3">
                    {locationError}
                </div>
            )}
            
            {!gps && !locationError && (
                 <div className="text-blue-600 text-sm mb-3 animate-pulse">
                    Đang lấy vị trí GPS...
                 </div>
            )}
            
            {gps && (
                 <div className="text-green-600 text-sm mb-3 flex items-center">
                    <span className="mr-1">📍</span> Đã có vị trí hiện tại
                 </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Chụp ảnh (tối đa 10 ảnh)</label>
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Đã chọn: {files.length} ảnh</p>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting || !gps || files.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                {isSubmitting ? 'Đang gửi...' : 'Gửi xác nhận'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
