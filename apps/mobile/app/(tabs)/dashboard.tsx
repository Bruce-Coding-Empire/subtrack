import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";

// Placeholder — real dashboard (stat cards, charts, upcoming renewals)
// built in feature 16.
export default function DashboardScreen() {
  const { user } = useSession();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-2 px-4">
        <Text className="font-sans-semibold text-base text-text-primary">
          {user ? `Hi, ${user.name}` : "Dashboard"}
        </Text>
        <Text className="font-sans text-xs text-text-muted">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
