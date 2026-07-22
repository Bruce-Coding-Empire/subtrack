"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { SpendTrendChart } from "@/components/dashboard/SpendTrendChart";
import { UpcomingRenewalsList } from "@/components/dashboard/UpcomingRenewalsList";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { getDashboardSummary, getSpendTrend } from "@/lib/dashboard";
import type { DashboardSummary, SpendTrend } from "@/types";

export function DashboardPageClient() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [spendTrend, setSpendTrend] = useState<SpendTrend | null>(null);
  const [spendTrendLoading, setSpendTrendLoading] = useState(true);
  const [spendTrendError, setSpendTrendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSummaryLoading(true);
      setSummaryError(null);
      const result = await getDashboardSummary();
      if (cancelled) return;

      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        setSummaryError(result.error ?? "Failed to load dashboard — please try again");
      }
      setSummaryLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSpendTrendLoading(true);
      setSpendTrendError(null);
      const result = await getSpendTrend();
      if (cancelled) return;

      if (result.success && result.data) {
        setSpendTrend(result.data);
      } else {
        setSpendTrendError(result.error ?? "Failed to load spend trend — please try again");
      }
      setSpendTrendLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
      <h1 className="text-base font-semibold text-text-primary">Dashboard</h1>

      {summaryLoading ? (
        <p className="py-16 text-center text-sm text-text-muted">Loading dashboard…</p>
      ) : summaryError ? (
        <p className="py-16 text-center text-sm text-error">{summaryError}</p>
      ) : !summary || summary.activeSubscriptionsCount === 0 ? (
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
                {spendTrendLoading ? (
                  <p className="py-16 text-center text-sm text-text-muted">Loading spend trend…</p>
                ) : spendTrendError ? (
                  <p className="py-16 text-center text-sm text-error">{spendTrendError}</p>
                ) : (
                  <SpendTrendChart points={spendTrend?.points ?? []} />
                )}
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
