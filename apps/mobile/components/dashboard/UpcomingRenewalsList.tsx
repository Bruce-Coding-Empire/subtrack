import { Text, View } from "react-native";

import { RenewalUrgencyPill } from "@/components/subscriptions/RenewalUrgencyPill";
import { formatCurrency } from "@/lib/format";
import type { UpcomingRenewal } from "@/lib/types";

type Props = {
  renewals: UpcomingRenewal[];
};

export function UpcomingRenewalsList({ renewals }: Props) {
  if (renewals.length === 0) {
    return (
      <Text className="py-8 text-center font-sans text-sm text-text-muted">
        No renewals due in the next 7 days.
      </Text>
    );
  }

  return (
    <View>
      {renewals.map((renewal, index) => (
        <View
          key={renewal.id}
          className={`flex-row items-center justify-between gap-3 py-3 ${index > 0 ? "border-t border-border-light" : ""}`}
        >
          <Text className="flex-1 font-sans-semibold text-sm text-text-primary" numberOfLines={1}>
            {renewal.name}
          </Text>
          <View className="flex-row items-center gap-3">
            <Text className="font-sans text-sm text-text-secondary">
              {formatCurrency(renewal.amount, renewal.currency)}
            </Text>
            <RenewalUrgencyPill nextRenewalDate={renewal.nextRenewalDate} />
          </View>
        </View>
      ))}
    </View>
  );
}
