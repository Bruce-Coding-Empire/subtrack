import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";

export function DashboardEmptyState() {
  const router = useRouter();

  return (
    <Card className="items-center gap-3 py-12">
      <Feather name="inbox" size={28} color={Colors.textMuted} />
      <Text className="text-center font-sans text-sm text-text-muted">
        You have no subscriptions yet — add one to see your dashboard.
      </Text>
      <Button label="Add your first subscription" onPress={() => router.push("/subscription/add")} />
    </Card>
  );
}
