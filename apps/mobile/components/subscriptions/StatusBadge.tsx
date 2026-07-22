import { Text, View } from "react-native";

import type { SubscriptionStatus } from "@/lib/types";

type Props = {
  status: SubscriptionStatus;
};

const STATUS_CLASSES: Record<SubscriptionStatus, string> = {
  active: "bg-success-light text-success-foreground",
  cancelled: "bg-surface-secondary text-text-secondary",
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: Props) {
  const colorClasses = STATUS_CLASSES[status];

  return (
    <View className={`self-start rounded-full px-2 py-0.5 ${colorClasses}`}>
      <Text className={`font-sans-medium text-xs ${colorClasses}`}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}
