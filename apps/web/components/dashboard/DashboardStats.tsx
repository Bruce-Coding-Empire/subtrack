import { StatCard } from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/format";
import type { DashboardSummary } from "@/types";

type Props = {
  summary: DashboardSummary;
};

export function DashboardStats({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total Monthly Spend" value={formatCurrency(summary.totalMonthlySpend, summary.baseCurrency)} />
      <StatCard label="Total Yearly Spend" value={formatCurrency(summary.totalYearlySpend, summary.baseCurrency)} />
      <StatCard label="Active Subscriptions" value={String(summary.activeSubscriptionsCount)} />
      <StatCard label="Upcoming Renewals (7d)" value={String(summary.upcomingRenewals.length)} />
    </div>
  );
}
