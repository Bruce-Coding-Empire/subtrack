import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";

type Props = {
  spendLimit: number | null;
  currentMonthSpend: number;
  percentageUsed: number | null;
  isOverLimit: boolean;
  baseCurrency: string;
};

export function SpendLimitProgress({ spendLimit, currentMonthSpend, percentageUsed, isOverLimit, baseCurrency }: Props) {
  const router = useRouter();

  if (spendLimit === null || percentageUsed === null) {
    return (
      <Card className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 font-sans text-sm text-text-muted">
          Set a monthly limit to track your spending against it.
        </Text>
        <Button label="Set a limit" onPress={() => router.push("/settings")} />
      </Card>
    );
  }

  const barColor = isOverLimit ? "bg-error" : percentageUsed >= 90 ? "bg-warning" : "bg-accent";
  const valueColor = isOverLimit ? "text-error" : percentageUsed >= 90 ? "text-warning" : "text-text-primary";

  return (
    <Card className="gap-3">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-sans-medium text-sm text-text-primary">Monthly Spend Limit</Text>
        <Text className={`font-sans-medium text-sm ${valueColor}`}>
          {formatCurrency(currentMonthSpend, baseCurrency)} / {formatCurrency(spendLimit, baseCurrency)}
        </Text>
      </View>

      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(percentageUsed, 100)}%` }} />
      </View>

      <Text className="font-sans text-xs text-text-muted">
        {percentageUsed.toFixed(1)}% used{isOverLimit ? " — over limit" : ""}
      </Text>
    </Card>
  );
}
