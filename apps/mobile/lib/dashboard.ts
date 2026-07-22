import { apiFetch } from "@/lib/api-client";
import type { ApiResponse, DashboardSummary, SpendTrend } from "@/lib/types";

export async function getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}

export async function getSpendTrend(months = 6): Promise<ApiResponse<SpendTrend>> {
  return apiFetch<SpendTrend>(`/dashboard/spend-trend?months=${months}`);
}
