import { Switch, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { ComingSoonBadge } from "@/components/ui/ComingSoonBadge";
import { Colors } from "@/constants/colors";

const NOTIFICATION_TOGGLES = [
  { id: "renewal-reminders", label: "Renewal Reminders" },
  { id: "spend-limit-alerts", label: "Spend Limit Alerts" },
];

export function NotificationsSection() {
  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-2">
        <Text className="font-sans-semibold text-base text-text-primary">Notifications</Text>
        <ComingSoonBadge />
      </View>
      {NOTIFICATION_TOGGLES.map((toggle) => (
        <View key={toggle.id} className="flex-row items-center justify-between">
          <Text className="font-sans-medium text-sm text-text-primary">{toggle.label}</Text>
          <Switch
            value={false}
            disabled
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Colors.surface}
          />
        </View>
      ))}
    </Card>
  );
}
