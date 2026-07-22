import { Tabs } from "expo-router";

import { Colors } from "@/constants/colors";

// Minimal 3-tab shell — just enough for the auth guard (feature 14) to have a
// real, testable destination after login. The full 4-item bar (incl. the
// prominent center "Add" tab per ui-rules.md) is built in feature 15, once
// "Add" has a real subscription-creation screen to open.
export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="subscriptions" options={{ title: "Subscriptions" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
