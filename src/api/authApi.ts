import { apiClient } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../features/auth/types/authTypes";

export async function registerRequest(payload: RegisterPayload) {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function loginRequest(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
}
