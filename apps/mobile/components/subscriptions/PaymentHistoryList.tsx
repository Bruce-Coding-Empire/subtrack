import { Text, View } from "react-native";

import { formatCurrency, formatDate } from "@/lib/format";
import type { PaymentHistoryEntry } from "@/lib/types";

type Props = {
  paymentHistory: PaymentHistoryEntry[];
};

export function PaymentHistoryList({ paymentHistory }: Props) {
  if (paymentHistory.length === 0) {
    return <Text className="py-6 text-center font-sans text-sm text-text-muted">No payment history yet.</Text>;
  }

  return (
    <View>
      {paymentHistory.map((entry, index) => (
        <View
          key={entry.id}
          className={`flex-row items-center justify-between py-2 ${
            index < paymentHistory.length - 1 ? "border-b border-border-light" : ""
          }`}
        >
          <Text className="font-sans text-sm text-text-primary">{formatDate(entry.paidAt)}</Text>
          <Text className="font-sans-medium text-sm text-text-primary">
            {formatCurrency(entry.amount, entry.currency)}
          </Text>
        </View>
      ))}
    </View>
  );
}
