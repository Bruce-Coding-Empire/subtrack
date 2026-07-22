import { apiFetch } from "@/lib/api-client";
import type { ApiResponse, UpdateUserInput, UserProfile } from "@/types";

// Fired whenever the profile is updated so long-lived components (e.g. the
// navbar, which fetches once on mount) can refresh without a full reload.
export const PROFILE_UPDATED_EVENT = "subtrack:profile-updated";

export async function getCurrentUserProfile(): Promise<ApiResponse<UserProfile>> {
  return apiFetch<UserProfile>("/users/me");
}

export async function updateCurrentUserProfile(
  input: UpdateUserInput,
): Promise<ApiResponse<UserProfile>> {
  const result = await apiFetch<UserProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (result.success) {
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  }
  return result;
}
