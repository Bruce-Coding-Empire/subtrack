import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NotificationsSection } from "@/components/settings/NotificationsSection";

export default function AlertsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        <Text className="font-sans-semibold text-lg text-text-primary">Alerts</Text>
        <NotificationsSection />
      </ScrollView>
    </SafeAreaView>
  );
}
