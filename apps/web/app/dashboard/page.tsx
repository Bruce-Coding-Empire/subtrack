import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { SpendTrendChart } from "@/components/dashboard/SpendTrendChart";
import { UpcomingRenewalsList } from "@/components/dashboard/UpcomingRenewalsList";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { mockDashboardSummary, mockSpendTrend } from "@/lib/mock-dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard - SubTrack",
  description: "Your subscription spend at a glance.",
};

export default function DashboardPage() {
  const summary = mockDashboardSummary;
  const spendTrend = mockSpendTrend;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
      <h1 className="text-base font-semibold text-text-primary">Dashboard</h1>

      {summary.activeSubscriptionsCount === 0 ? (
        <DashboardEmptyState />
      ) : (
        <>
          <DashboardStats summary={summary} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Spend Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <SpendTrendChart points={spendTrend.points} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBreakdownChart data={summary.categoryBreakdown} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Upcoming Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingRenewalsList renewals={summary.upcomingRenewals} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
