import * as SecureStore from "expo-secure-store";

import { apiFetch } from "@/lib/api-client";
import type { ApiResponse, AuthResponse } from "@/lib/types";

const REFRESH_TOKEN_KEY = "refreshToken";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

type SessionInvalidatedListener = () => void;
const invalidationListeners = new Set<SessionInvalidatedListener>();

// Lets lib/auth-context.tsx react to a session dying inside apiFetch (a
// failed silent refresh on some later authenticated call) without api-client.ts
// importing React — same hand-rolled pub/sub precedent as apps/web's
// PROFILE_UPDATED_EVENT, adapted since React Native has no `window` to dispatch on.
export function subscribeToSessionInvalidation(listener: SessionInvalidatedListener): () => void {
  invalidationListeners.add(listener);
  return () => invalidationListeners.delete(listener);
}

async function clearSession(): Promise<void> {
  accessToken = null;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (result.success && result.data) {
    accessToken = result.data.accessToken;
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.data.refreshToken);
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
    accessToken = result.data.accessToken;
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.data.refreshToken);
  }
  return result;
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
  await clearSession();
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const result = await apiFetch<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (!result.success || !result.data) {
      await clearSession();
      invalidationListeners.forEach((listener) => listener());
      return false;
    }

    accessToken = result.data.accessToken;
    return true;
  } catch (error) {
    console.error("[refreshAccessToken]", error);
    return false;
  }
}
