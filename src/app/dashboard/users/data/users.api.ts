import { getAccessToken } from "@/services/auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type UserItem = {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  userTier?: string;
  createdAt?: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchUsers(): Promise<UserItem[]> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch users", res.status, text);
    throw new ApiError(text || `Fetch users failed: ${res.status}` , res.status);
  }

  const data: unknown = await res.json();
  // Map to lightweight shape (avoid any)
  const arr = Array.isArray(data) ? data : [];
  return arr.map((u): UserItem => {
    const obj = u as Record<string, unknown>;
    return {
      id: Number(obj.id ?? 0),
      username: String(obj.username ?? ""),
      fullName: typeof obj.fullName === "string" ? obj.fullName : (typeof obj.name === "string" ? obj.name : undefined),
      email: typeof obj.email === "string" ? obj.email : undefined,
      phone: typeof obj.phone === "string" ? obj.phone : undefined,
      userTier: typeof obj.userTier === "string" ? obj.userTier : undefined,
      createdAt: typeof obj.createdAt === "string" ? obj.createdAt : (obj.createdAt instanceof Date ? obj.createdAt.toISOString() : undefined),
    };
  });
}
