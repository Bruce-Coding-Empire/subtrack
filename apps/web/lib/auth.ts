import { apiFetch } from "@/lib/api-client";
import { SESSION_COOKIE_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "@/lib/constants";
import type { ApiResponse, AuthResponse, User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken: string | null = null;
let currentUser: User | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

function markSession(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; max-age=${SESSION_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearSession(): void {
  accessToken = null;
  currentUser = null;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`;
}

function setSession(auth: AuthResponse): void {
  accessToken = auth.accessToken;
  currentUser = auth.user;
  markSession();
}

export async function login(
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (result.success && result.data) {
    setSession(result.data);
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
    setSession(result.data);
  }
  return result;
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
  clearSession();
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const body = (await res.json()) as ApiResponse<{ accessToken: string }>;
    if (!res.ok || !body.success || !body.data) {
      return false;
    }
    accessToken = body.data.accessToken;
    markSession();
    return true;
  } catch (error) {
    console.error("[refreshAccessToken]", error);
    return false;
  }
}
