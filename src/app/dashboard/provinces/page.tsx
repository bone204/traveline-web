"use client";

import { useState, useEffect } from "react";
import { provincesApi, Province } from "@/api/provinces.api";
import Link from "next/link";

export default function ProvincesPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    provincesApi.findAll().then((data) => {
      setProvinces(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Tỉnh thành</h1>
        <Link
          href="/dashboard/provinces/bulk-upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Tải ảnh hàng loạt
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {provinces.map((province) => (
          <div
            key={province.id}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
              {province.avatarUrl ? (
                <img
                  src={province.avatarUrl}
                  alt={province.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No img
                </div>
              )}
            </div>
            <div>
              <div className="font-bold text-gray-800">{province.name}</div>
              <div className="text-xs text-gray-500 uppercase">{province.code}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
