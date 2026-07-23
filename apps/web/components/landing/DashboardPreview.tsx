import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { SpendTrendChart } from "@/components/dashboard/SpendTrendChart";
import type { CategoryBreakdownEntry, SpendTrendPoint } from "@/types";

const MOCK_STATS = [
  { label: "Total Monthly Spend", value: "$284.50" },
  { label: "Total Yearly Spend", value: "$3,414" },
  { label: "Active Subscriptions", value: "14" },
  { label: "Upcoming Renewals (7d)", value: "3" },
];

const MOCK_CATEGORY_BREAKDOWN: CategoryBreakdownEntry[] = [
  { category: "entertainment", amount: 99.5, percentage: 35 },
  { category: "software", amount: 85, percentage: 30 },
  { category: "fitness", amount: 43, percentage: 15 },
  { category: "utilities", amount: 34, percentage: 12 },
  { category: "other", amount: 23, percentage: 8 },
];

const MOCK_SPEND_TREND: SpendTrendPoint[] = [
  { month: "2026-02", amount: 210 },
  { month: "2026-03", amount: 225 },
  { month: "2026-04", amount: 240 },
  { month: "2026-05", amount: 255 },
  { month: "2026-06", amount: 268 },
  { month: "2026-07", amount: 284.5 },
];

// Decorative mockup of the real dashboard — never wired to live data, purely illustrative.
export function DashboardPreview() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none mx-auto w-full max-w-2xl select-none rounded-2xl border border-border bg-surface-secondary p-4 shadow-xs sm:p-6"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOCK_STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Spend Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendTrendChart points={MOCK_SPEND_TREND} />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart data={MOCK_CATEGORY_BREAKDOWN} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
