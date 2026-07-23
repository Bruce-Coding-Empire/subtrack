import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { SpendLimitProgress } from "@/components/dashboard/SpendLimitProgress";
import { SpendTrendChart } from "@/components/dashboard/SpendTrendChart";
import { UpcomingRenewalsList } from "@/components/dashboard/UpcomingRenewalsList";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { Colors } from "@/constants/colors";
import { useSession } from "@/lib/auth-context";
import { getDashboardSummary, getSpendTrend } from "@/lib/dashboard";
import type { DashboardSummary, SpendTrend } from "@/lib/types";

export default function DashboardScreen() {
  const { user } = useSession();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [spendTrend, setSpendTrend] = useState<SpendTrend | null>(null);
  const [spendTrendLoading, setSpendTrendLoading] = useState(true);
  const [spendTrendError, setSpendTrendError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((key) => key + 1);
    }, []),
  );

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
  }, [refreshKey]);

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
  }, [refreshKey]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        <Text className="font-sans-semibold text-lg text-text-primary">
          {user ? `Hi, ${user.name}` : "Dashboard"}
        </Text>

        {summaryLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : summaryError ? (
          <Text className="py-16 text-center font-sans text-sm text-error">{summaryError}</Text>
        ) : !summary || summary.activeSubscriptionsCount === 0 ? (
          <DashboardEmptyState />
        ) : (
          <>
            <DashboardStats summary={summary} />

            <SpendLimitProgress
              spendLimit={summary.spendLimit}
              currentMonthSpend={summary.currentMonthSpend}
              percentageUsed={summary.percentageUsed}
              isOverLimit={summary.isOverLimit}
              baseCurrency={summary.baseCurrency}
            />

            <Card className="gap-4">
              <Text className="font-sans-semibold text-base text-text-primary">Spend Trend</Text>
              {spendTrendLoading ? (
                <View className="items-center py-16">
                  <ActivityIndicator color={Colors.accent} />
                </View>
              ) : spendTrendError ? (
                <Text className="py-16 text-center font-sans text-sm text-error">{spendTrendError}</Text>
              ) : (
                <SpendTrendChart points={spendTrend?.points ?? []} />
              )}
            </Card>

            <Card className="gap-4">
              <Text className="font-sans-semibold text-base text-text-primary">Category Breakdown</Text>
              <CategoryBreakdownChart data={summary.categoryBreakdown} />
            </Card>

            <Card className="gap-1">
              <Text className="font-sans-semibold text-base text-text-primary">Upcoming Renewals</Text>
              <UpcomingRenewalsList renewals={summary.upcomingRenewals} />
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
