export type AuthRole = "USER" | "MOD" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
