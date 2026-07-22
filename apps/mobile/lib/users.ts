import { apiFetch } from "@/lib/api-client";
import type { ApiResponse, UpdateUserInput, UserProfile } from "@/lib/types";

export async function getCurrentUserProfile(): Promise<ApiResponse<UserProfile>> {
  return apiFetch<UserProfile>("/users/me");
}

export async function updateCurrentUserProfile(
  input: UpdateUserInput,
): Promise<ApiResponse<UserProfile>> {
  return apiFetch<UserProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
