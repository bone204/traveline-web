import { getAccessToken } from "@/services/auth.service";

export type VoucherDiscountType = "percentage" | "fixed";

export interface VoucherItem {
  id: number;
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  value: string;
  maxDiscountValue?: string;
  minOrderValue?: string;
  usedCount: number;
  maxUsage: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoucherPayload {
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  value: number;
  maxDiscountValue?: number;
  minOrderValue?: number;
  maxUsage: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchVouchers(params?: {
  active?: boolean;
  code?: string;
}): Promise<VoucherItem[]> {
  const token = getAccessToken();
  if (!token) {
    throw new ApiError(401, "No access token");
  }

  const queryParams = new URLSearchParams();
  if (params?.active !== undefined) queryParams.append("active", String(params.active));
  if (params?.code) queryParams.append("code", params.code);

  const queryString = queryParams.toString();
  const url = `http://localhost:4000/vouchers${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch vouchers: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchVoucherById(id: number): Promise<VoucherItem> {
  const token = getAccessToken();
  if (!token) {
    throw new ApiError(401, "No access token");
  }

  const response = await fetch(`http://localhost:4000/vouchers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch voucher: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteVoucher(id: number): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new ApiError(401, "No access token");
  }

  const response = await fetch(`http://localhost:4000/vouchers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to delete voucher: ${response.statusText}`);
  }
}

export async function createVoucher(payload: CreateVoucherPayload): Promise<VoucherItem> {
  const token = getAccessToken();
  if (!token) {
    throw new ApiError(401, "No access token");
  }

  const response = await fetch("http://localhost:4000/vouchers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, errorData.message || "Failed to create voucher");
  }

  return response.json();
}
