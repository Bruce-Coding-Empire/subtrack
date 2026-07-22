import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SubscriptionForm, type SubscriptionFormValues } from "@/components/subscriptions/SubscriptionForm";
import { Colors } from "@/constants/colors";
import { createSubscription, getSubscription, updateSubscription } from "@/lib/subscriptions";
import type { SubscriptionDetail } from "@/lib/types";

export default function AddEditSubscriptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const subscriptionId = id;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const result = await getSubscription(subscriptionId);
      if (cancelled) return;
      if (result.success && result.data) {
        setSubscription(result.data);
      } else {
        setLoadError(result.error ?? "Failed to load subscription — please try again");
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(values: SubscriptionFormValues) {
    setFormError(null);
    const input = {
      name: values.name,
      cost: values.cost,
      currency: values.currency,
      billingCycle: values.billingCycle,
      customIntervalDays: values.billingCycle === "custom" ? (values.customIntervalDays ?? null) : null,
      category: values.category,
      startDate: values.startDate,
    };

    const result = id ? await updateSubscription(id, input) : await createSubscription(input);

    if (!result.success) {
      setFormError(result.error ?? `Failed to ${isEditing ? "update" : "create"} subscription — please try again`);
      return;
    }

    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </Pressable>
        <Text className="font-sans-semibold text-base text-text-primary">
          {isEditing ? "Edit Subscription" : "Add Subscription"}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : loadError ? (
        <Text className="px-4 py-16 text-center font-sans text-sm text-error">{loadError}</Text>
      ) : (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerClassName="p-4" keyboardShouldPersistTaps="handled">
            <SubscriptionForm
              defaultValues={
                subscription
                  ? {
                      name: subscription.name,
                      cost: String(subscription.cost),
                      currency: subscription.currency,
                      billingCycle: subscription.billingCycle,
                      customIntervalDays: subscription.customIntervalDays
                        ? String(subscription.customIntervalDays)
                        : "",
                      category: subscription.category,
                      startDate: subscription.startDate,
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              submitLabel={isEditing ? "Save Changes" : "Add Subscription"}
              formError={formError}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
