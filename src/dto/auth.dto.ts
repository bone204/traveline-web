export type LoginRequest = {
  username: string;
  password: string;
};

export type UserRole = "user" | "admin";

export type AuthTokens = {
  access_token: string;
  refreshToken: string;
  role: UserRole;
};

export type UserProfile = {
  userId: number;
  username: string;
  role: UserRole;
};
