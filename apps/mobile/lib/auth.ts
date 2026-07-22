import { apiFetch, refreshAccessToken } from "@/lib/api-client";
import {
  clearSession,
  getStoredRefreshToken,
  setAccessToken,
  setStoredRefreshToken,
  subscribeToSessionInvalidation,
} from "@/lib/token-store";
import type { ApiResponse, AuthResponse } from "@/lib/types";

export { getStoredRefreshToken, refreshAccessToken, subscribeToSessionInvalidation };

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (result.success && result.data) {
    setAccessToken(result.data.accessToken);
    await setStoredRefreshToken(result.data.refreshToken);
  }
  return result;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  const result = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (result.success && result.data) {
    setAccessToken(result.data.accessToken);
    await setStoredRefreshToken(result.data.refreshToken);
  }
  return result;
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
  await clearSession();
}
