import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/subscriptions/CategoryBadge";
import { RenewalUrgencyPill } from "@/components/subscriptions/RenewalUrgencyPill";
import { formatBillingCycle, formatCurrency } from "@/lib/format";
import type { Subscription } from "@/lib/types";

type Props = {
  subscription: Subscription;
  onPress: () => void;
};

export function SubscriptionCard({ subscription, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 font-sans-semibold text-sm text-text-primary" numberOfLines={1}>
            {subscription.name}
          </Text>
          <CategoryBadge category={subscription.category} />
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <Text className="font-sans text-xs text-text-secondary">
            {formatCurrency(subscription.cost, subscription.currency)} · {formatBillingCycle(subscription)}
          </Text>
          <RenewalUrgencyPill nextRenewalDate={subscription.nextRenewalDate} />
        </View>
      </Card>
    </Pressable>
  );
}
