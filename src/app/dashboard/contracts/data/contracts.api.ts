import { getAccessToken } from "@/services/auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export enum ContractStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export type ContractItem = {
  id: number;
  userId: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  businessType: string;
  businessName?: string;
  citizenId?: string;
  status: ContractStatus;
  totalVehicles: number;
  totalRentalTimes: number;
  averageRating: number;
  createdAt?: string;
  statusUpdatedAt?: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchContracts(): Promise<ContractItem[]> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/rental-contracts`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch contracts", res.status, text);
    throw new ApiError(text || `Fetch contracts failed: ${res.status}`, res.status);
  }

  const data: unknown = await res.json();
  const arr = Array.isArray(data) ? data : [];
  return arr.map((c): ContractItem => {
    const obj = c as Record<string, unknown>;
    return {
      id: Number(obj.id ?? 0),
      userId: Number(obj.userId ?? 0),
      fullName: typeof obj.fullName === "string" ? obj.fullName : undefined,
      email: typeof obj.email === "string" ? obj.email : undefined,
      phoneNumber: typeof obj.phoneNumber === "string" ? obj.phoneNumber : undefined,
      businessType: String(obj.businessType ?? "personal"),
      businessName: typeof obj.businessName === "string" ? obj.businessName : undefined,
      citizenId: typeof obj.citizenId === "string" ? obj.citizenId : undefined,
      status: (obj.status as ContractStatus) ?? ContractStatus.PENDING,
      totalVehicles: Number(obj.totalVehicles ?? 0),
      totalRentalTimes: Number(obj.totalRentalTimes ?? 0),
      averageRating: Number(obj.averageRating ?? 0),
      createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
      statusUpdatedAt: typeof obj.statusUpdatedAt === "string" ? obj.statusUpdatedAt : undefined,
    };
  });
}

export async function deleteContract(contractId: number): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/rental-contracts/${contractId}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to delete contract", res.status, text);
    throw new ApiError(text || `Delete contract failed: ${res.status}`, res.status);
  }
}

export async function approveContract(contractId: number): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/rental-contracts/${contractId}/approve`, {
    method: "PATCH",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to approve contract", res.status, text);
    throw new ApiError(text || `Approve contract failed: ${res.status}`, res.status);
  }
}

export async function rejectContract(contractId: number, reason: string): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/rental-contracts/${contractId}/reject`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ rejectedReason: reason }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to reject contract", res.status, text);
    throw new ApiError(text || `Reject contract failed: ${res.status}`, res.status);
  }
}
