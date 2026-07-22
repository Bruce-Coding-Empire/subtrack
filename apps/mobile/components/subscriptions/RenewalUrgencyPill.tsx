import { Text, View } from "react-native";

import { formatDate } from "@/lib/format";
import { getRenewalUrgency } from "@/lib/renewal-urgency";

type Props = {
  nextRenewalDate: string;
};

const URGENCY_CLASSES = {
  error: "bg-error-light text-error-foreground",
  warning: "bg-warning-light text-warning-foreground",
  info: "bg-info-light text-info-foreground",
} as const;

export function RenewalUrgencyPill({ nextRenewalDate }: Props) {
  const urgency = getRenewalUrgency(nextRenewalDate);

  if (!urgency) {
    return <Text className="font-sans text-sm text-text-primary">{formatDate(nextRenewalDate)}</Text>;
  }

  const colorClasses = URGENCY_CLASSES[urgency];

  return (
    <View className={`self-start rounded-full px-2 py-0.5 ${colorClasses}`}>
      <Text className={`font-sans-medium text-xs ${colorClasses}`}>{formatDate(nextRenewalDate)}</Text>
    </View>
  );
}
