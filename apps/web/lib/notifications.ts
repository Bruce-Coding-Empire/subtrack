import { apiFetch } from "@/lib/api-client";
import type { ApiResponse, NotificationPreferences, UpdateNotificationPreferencesInput } from "@/types";

export async function getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
  return apiFetch<NotificationPreferences>("/notifications/preferences");
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
): Promise<ApiResponse<NotificationPreferences>> {
  return apiFetch<NotificationPreferences>("/notifications/preferences", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
