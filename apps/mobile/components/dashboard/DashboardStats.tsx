import { View } from "react-native";

import { StatCard } from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/format";
import type { DashboardSummary } from "@/lib/types";

type Props = {
  summary: DashboardSummary;
};

export function DashboardStats({ summary }: Props) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <StatCard label="Total Monthly Spend" value={formatCurrency(summary.totalMonthlySpend, summary.baseCurrency)} />
        <StatCard label="Total Yearly Spend" value={formatCurrency(summary.totalYearlySpend, summary.baseCurrency)} />
      </View>
      <View className="flex-row gap-3">
        <StatCard label="Active Subscriptions" value={String(summary.activeSubscriptionsCount)} />
        <StatCard label="Upcoming Renewals (7d)" value={String(summary.upcomingRenewals.length)} />
      </View>
    </View>
  );
}
