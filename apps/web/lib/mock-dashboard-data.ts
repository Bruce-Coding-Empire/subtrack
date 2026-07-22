import type { DashboardSummary, SpendTrend } from "@/types";

export const mockDashboardSummary: DashboardSummary = {
  totalMonthlySpend: 145825.93,
  totalYearlySpend: 1749911.16,
  baseCurrency: "RWF",
  activeSubscriptionsCount: 7,
  categoryBreakdown: [
    { category: "utilities", amount: 45000, percentage: 30.9 },
    { category: "entertainment", amount: 38225.68, percentage: 26.2 },
    { category: "fitness", amount: 36769.04, percentage: 25.2 },
    { category: "software", amount: 24359.86, percentage: 16.7 },
    { category: "other", amount: 1471.35, percentage: 1.0 },
  ],
  upcomingRenewals: [
    { id: "1add5d34-f0f6-47b2-b505-94e4cd62acc8", name: "GitHub Copilot", amount: 10, currency: "USD", nextRenewalDate: "2026-07-24" },
    { id: "4eadd51a-1b43-4f48-b62d-ca6748572c57", name: "Cloud Backup", amount: 8.5, currency: "EUR", nextRenewalDate: "2026-07-24" },
    { id: "c119deec-9861-43ee-ba3a-75fd3b9c7807", name: "REG Electricity", amount: 45000, currency: "RWF", nextRenewalDate: "2026-07-27" },
  ],
};

export const mockSpendTrend: SpendTrend = {
  baseCurrency: "RWF",
  points: [
    { month: "2026-02", amount: 130200 },
    { month: "2026-03", amount: 134850 },
    { month: "2026-04", amount: 138100 },
    { month: "2026-05", amount: 137400 },
    { month: "2026-06", amount: 141950 },
    { month: "2026-07", amount: 145825.93 },
  ],
};
