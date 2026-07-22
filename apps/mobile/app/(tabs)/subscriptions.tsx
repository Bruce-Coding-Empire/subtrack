import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Placeholder — real subscriptions list/add/detail flow built in feature 15.
export default function SubscriptionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-2 px-4">
        <Text className="font-sans-semibold text-base text-text-primary">Subscriptions</Text>
        <Text className="font-sans text-xs text-text-muted">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
