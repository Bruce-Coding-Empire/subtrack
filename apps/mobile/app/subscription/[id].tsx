import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/subscriptions/CategoryBadge";
import { PaymentHistoryList } from "@/components/subscriptions/PaymentHistoryList";
import { RenewalUrgencyPill } from "@/components/subscriptions/RenewalUrgencyPill";
import { StatusBadge } from "@/components/subscriptions/StatusBadge";
import { Colors } from "@/constants/colors";
import { formatBillingCycle, formatCurrency, formatDate } from "@/lib/format";
import { cancelSubscription, deleteSubscription, getSubscription } from "@/lib/subscriptions";
import type { SubscriptionDetail } from "@/lib/types";

export default function SubscriptionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setIsLoading(true);
        setError(null);
        const result = await getSubscription(id);
        if (cancelled) return;

        if (result.success && result.data) {
          setSubscription(result.data);
        } else {
          setError(result.error ?? "Subscription not found");
        }
        setIsLoading(false);
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  function handleCancel() {
    Alert.alert(
      "Cancel this subscription?",
      "It will stop renewing and be excluded from your dashboard totals, but stays visible in your subscriptions list under the Cancelled filter.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            const result = await cancelSubscription(id);
            setIsCancelling(false);
            if (result.success && result.data) {
              setSubscription((current) => (current ? { ...current, ...result.data } : current));
            } else {
              Alert.alert("Error", result.error ?? "Failed to cancel subscription — please try again");
            }
          },
        },
      ],
    );
  }

  function handleDelete() {
    Alert.alert("Delete this subscription?", "This permanently removes it. This action cannot be undone.", [
      { text: "Keep Subscription", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          const result = await deleteSubscription(id);
          setIsDeleting(false);
          if (result.success) {
            router.back();
          } else {
            Alert.alert("Error", result.error ?? "Failed to delete subscription — please try again");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </Pressable>
        <Text className="flex-1 font-sans-semibold text-base text-text-primary" numberOfLines={1}>
          {subscription?.name ?? "Subscription"}
        </Text>
        {subscription ? (
          <Pressable
            onPress={() => router.push(`/subscription/add?id=${subscription.id}`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit subscription"
          >
            <Feather name="edit-2" size={18} color={Colors.accent} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : error || !subscription ? (
        <Text className="px-4 py-16 text-center font-sans text-sm text-error">
          {error ?? "Subscription not found"}
        </Text>
      ) : (
        <ScrollView contentContainerClassName="gap-4 p-4">
          <View className="flex-row flex-wrap items-center gap-2">
            <CategoryBadge category={subscription.category} />
            <StatusBadge status={subscription.status} />
          </View>

          <Card className="gap-4">
            <View className="flex-row justify-between">
              <View className="gap-1">
                <Text className="font-sans text-xs text-text-muted">Cost</Text>
                <Text className="font-sans text-sm text-text-primary">
                  {formatCurrency(subscription.cost, subscription.currency)}
                </Text>
              </View>
              <View className="gap-1">
                <Text className="font-sans text-xs text-text-muted">Cycle</Text>
                <Text className="font-sans text-sm text-text-primary">{formatBillingCycle(subscription)}</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="gap-1">
                <Text className="font-sans text-xs text-text-muted">Start Date</Text>
                <Text className="font-sans text-sm text-text-primary">{formatDate(subscription.startDate)}</Text>
              </View>
              <View className="items-end gap-1">
                <Text className="font-sans text-xs text-text-muted">Next Renewal</Text>
                <RenewalUrgencyPill nextRenewalDate={subscription.nextRenewalDate} />
              </View>
            </View>
          </Card>

          <Card className="gap-3">
            <Text className="font-sans-semibold text-sm text-text-primary">Payment History</Text>
            <PaymentHistoryList paymentHistory={subscription.paymentHistory} />
          </Card>

          <View className="gap-2">
            {subscription.status === "active" && (
              <Pressable
                onPress={handleCancel}
                disabled={isCancelling}
                className={`items-center rounded-md border border-error bg-surface px-4 py-2 ${isCancelling ? "opacity-50" : ""}`}
              >
                <Text className="font-sans-medium text-sm text-error">
                  {isCancelling ? "Cancelling…" : "Cancel Subscription"}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              className={`items-center rounded-md bg-error px-4 py-2 ${isDeleting ? "opacity-50" : ""}`}
            >
              <Text className="font-sans-medium text-sm text-white">{isDeleting ? "Deleting…" : "Delete"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
