import { Feather } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { Colors } from "@/constants/colors";

function AddTabButton() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center">
      <Pressable
        onPress={() => router.push("/subscription/add")}
        accessibilityRole="button"
        accessibilityLabel="Add Subscription"
        hitSlop={8}
        className="-mt-6 h-14 w-14 items-center justify-center rounded-full bg-accent shadow-sm"
      >
        <Feather name="plus" size={26} color={Colors.accentForeground} />
      </Pressable>
    </View>
  );
}

// Four-item bar per ui-rules.md — the prominent center "Add" tab has no real
// (tabs)/ screen of its own (the real add screen lives outside the tab group,
// per architecture.md, so it renders without the tab bar and with a back
// button). "add" is a real route file purely so Tabs renders a slot for it;
// its tabPress is intercepted before navigation and its tabBarButton is
// swapped for the raised circular button instead of a normal tab item.
export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Subscriptions",
          tabBarIcon: ({ color, size }) => <Feather name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarButton: () => <AddTabButton />,
        }}
        listeners={{
          tabPress: (event) => event.preventDefault(),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
