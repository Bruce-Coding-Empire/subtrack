import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "refreshToken";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function clearSession(): Promise<void> {
  accessToken = null;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

type SessionInvalidatedListener = () => void;
const invalidationListeners = new Set<SessionInvalidatedListener>();

// Lets lib/auth-context.tsx react to a session dying inside apiFetch (a
// failed silent refresh on some later authenticated call) without
// api-client.ts importing React — same hand-rolled pub/sub precedent as
// apps/web's PROFILE_UPDATED_EVENT, adapted since React Native has no
// `window` to dispatch on.
export function subscribeToSessionInvalidation(listener: SessionInvalidatedListener): () => void {
  invalidationListeners.add(listener);
  return () => invalidationListeners.delete(listener);
}

export function notifySessionInvalidated(): void {
  invalidationListeners.forEach((listener) => listener());
}
