import { View, Text } from "react-native";

import { Card } from "@/components/ui/Card";
import { ComingSoonBadge } from "@/components/ui/ComingSoonBadge";
import { Input } from "@/components/ui/Input";

export function SpendLimitSection() {
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-2">
        <Text className="font-sans-semibold text-base text-text-primary">Monthly Spend Limit</Text>
        <ComingSoonBadge />
      </View>
      <Input placeholder="No limit set" editable={false} className="opacity-60" keyboardType="decimal-pad" />
    </Card>
  );
}
