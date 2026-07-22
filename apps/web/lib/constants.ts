// Non-httpOnly marker cookie, set/cleared client-side by lib/auth.ts.
// Its presence is an optimistic UX signal for proxy.ts only — the real
// refresh token lives in the API's own httpOnly cookie (a different origin
// in dev, localhost:8000 vs localhost:3000), which the web server can never
// read. Every real authorization decision still happens at the API.
export const SESSION_COOKIE_NAME = "subtrack_session";

// Mirrors REFRESH_TOKEN_MAX_AGE_MS ("7d") in apps/api/.env — keep in sync.
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
