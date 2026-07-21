import { apiFetch } from "@/lib/api-client";
import type {
  ApiResponse,
  CreateSubscriptionInput,
  PaginatedSubscriptions,
  Subscription,
  SubscriptionDetail,
  SubscriptionStatus,
  UpdateSubscriptionInput,
} from "@/types";

type ListSubscriptionsParams = {
  status?: SubscriptionStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export async function listSubscriptions(
  params: ListSubscriptionsParams = {},
): Promise<ApiResponse<PaginatedSubscriptions>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  return apiFetch<PaginatedSubscriptions>(`/subscriptions${queryString ? `?${queryString}` : ""}`);
}

export async function getSubscription(id: string): Promise<ApiResponse<SubscriptionDetail>> {
  return apiFetch<SubscriptionDetail>(`/subscriptions/${id}`);
}

export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<ApiResponse<Subscription>> {
  return apiFetch<Subscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSubscription(
  id: string,
  input: UpdateSubscriptionInput,
): Promise<ApiResponse<Subscription>> {
  return apiFetch<Subscription>(`/subscriptions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function cancelSubscription(id: string): Promise<ApiResponse<Subscription>> {
  return apiFetch<Subscription>(`/subscriptions/${id}/cancel`, { method: "PATCH" });
}

export async function deleteSubscription(id: string): Promise<ApiResponse<null>> {
  return apiFetch<null>(`/subscriptions/${id}`, { method: "DELETE" });
}
