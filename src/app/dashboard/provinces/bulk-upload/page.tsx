"use client";

import { useState, useEffect, useCallback } from "react";
import { provincesApi, Province } from "@/api/provinces.api";
import { toast } from "react-hot-toast";

export default function ProvinceBulkUploadPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [files, setFiles] = useState<{ file: File; matchedProvince?: Province }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    provincesApi.findAll().then(setProvinces);
  }, []);

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map((file) => {
      const fileName = file.name.split(".")[0];
      const normalizedName = normalize(fileName);

      const matchedProvince = provinces.find(
        (p) => normalize(p.name) === normalizedName || normalize(p.code) === normalizedName
      );

      return { file, matchedProvince };
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);

    const updates: { id: number; avatarUrl: string }[] = [];
    let completedCount = 0;

    try {
      for (const item of files) {
        if (!item.matchedProvince) {
          completedCount++;
          continue;
        }

        const { url } = await provincesApi.uploadImage(item.file);
        updates.push({ id: item.matchedProvince.id, avatarUrl: url });
        
        completedCount++;
        setUploadProgress(Math.round((completedCount / files.length) * 100));
      }

      if (updates.length > 0) {
        await provincesApi.bulkUpdate(updates);
        toast.success(`Cập nhật thành công ${updates.length} tỉnh thành!`);
        setFiles([]);
      } else {
        toast.error("Không tìm thấy tỉnh nào khớp để cập nhật.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã có lỗi xảy ra trong quá trình tải lên.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Tải ảnh đại diện tỉnh thành</h1>
        <p className="text-gray-600">
          Kéo thả hoặc chọn nhiều ảnh. Hệ thống sẽ tự động khớp theo tên file (VD: AnGiang.jpg → An Giang).
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-200 text-center mb-6">
        <input
          type="file"
          id="fileInput"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
        />
        <label htmlFor="fileInput" className="cursor-pointer block">
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            <span className="text-lg font-medium">Chọn ảnh hoặc kéo thả vào đây</span>
            <span className="text-sm text-gray-500 mt-1">Hỗ trợ JPG, PNG, WEBP</span>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="font-medium">{files.length} file đã chọn</span>
            <button
              onClick={() => setFiles([])}
              className="text-red-500 text-sm hover:underline"
              disabled={isUploading}
            >
              Xóa tất cả
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2">Tên file</th>
                  <th className="px-4 py-2">Khớp với tỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {files.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm">{item.file.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.matchedProvince ? (
                        <span className="text-green-600 font-medium">
                          ✓ {item.matchedProvince.name}
                        </span>
                      ) : (
                        <span className="text-red-400 italic">Chưa khớp</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Đang tải lên...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
          isUploading || files.length === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
        }`}
      >
        {isUploading ? "Đang xử lý..." : "Bắt đầu cập nhật"}
      </button>
    </div>
  );
}
