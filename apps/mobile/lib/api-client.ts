import {
  clearSession,
  getAccessToken,
  getStoredRefreshToken,
  notifySessionInvalidated,
  setAccessToken,
} from "@/lib/token-store";
import type { ApiResponse } from "@/lib/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function rawFetch<T>(
  path: string,
  options: RequestInit,
): Promise<{ status: number; body: ApiResponse<T> }> {
  const accessToken = getAccessToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  const body = (await res.json()) as ApiResponse<T>;
  return { status: res.status, body };
}

// Uses rawFetch directly rather than apiFetch: apiFetch calls this on a 401
// to retry, so going through apiFetch here would recurse.
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const { body: result } = await rawFetch<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (!result.success || !result.data) {
      await clearSession();
      notifySessionInvalidated();
      return false;
    }

    setAccessToken(result.data.accessToken);
    return true;
  } catch (error) {
    console.error("[refreshAccessToken]", error);
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const first = await rawFetch<T>(path, options);
    if (first.status !== 401 || path.startsWith("/auth/")) {
      return first.body;
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return first.body;
    }

    const retried = await rawFetch<T>(path, options);
    return retried.body;
  } catch (error) {
    console.error("[apiFetch]", error);
    return { success: false, error: "Network error — please try again" };
  }
}
