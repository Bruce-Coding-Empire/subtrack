import { apiFetch } from "@/lib/api-client";
import type {
  ApiResponse,
  CreateSubscriptionInput,
  DetectedSubscription,
  Subscription,
} from "@/types";

export async function listDetectedSubscriptions(): Promise<
  ApiResponse<{ items: DetectedSubscription[] }>
> {
  return apiFetch<{ items: DetectedSubscription[] }>("/integrations/detected");
}

export async function approveDetectedSubscription(
  id: string,
  input: CreateSubscriptionInput,
): Promise<ApiResponse<Subscription>> {
  return apiFetch<Subscription>(`/integrations/detected/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function dismissDetectedSubscription(id: string): Promise<ApiResponse<null>> {
  return apiFetch<null>(`/integrations/detected/${id}/dismiss`, { method: "POST" });
}
