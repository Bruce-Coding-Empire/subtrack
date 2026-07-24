import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/colors";

const FEATURES = [
  {
    icon: "layers" as const,
    title: "Track everything",
    description: "Any currency, any billing cycle — weekly, monthly, yearly, or custom.",
  },
  {
    icon: "bell" as const,
    title: "Never miss a renewal",
    description: "Renewal dates and payment history, kept up to date automatically.",
  },
  {
    icon: "pie-chart" as const,
    title: "See where your money goes",
    description: "Total spend, category breakdown, and how it trends over time.",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-between px-4 py-8">
        <View className="items-center gap-3 pt-8">
          <Image
            source={require("@/assets/images/subtrack.png")}
            style={{ width: 88, height: 88 }}
            contentFit="contain"
          />
          <Text className="font-sans-bold text-lg text-text-primary">SubTrack</Text>
        </View>

        <View className="gap-6">
          <View className="items-center gap-2">
            <Text className="text-center font-sans-semibold text-xl text-text-primary">
              Your subscriptions are quietly draining you.
            </Text>
            <Text className="text-center font-sans text-sm text-text-secondary">
              Track every subscription, every currency, every renewal — in one place.
            </Text>
          </View>

          <View className="gap-4">
            {FEATURES.map((feature) => (
              <View key={feature.title} className="flex-row items-start gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-accent-light">
                  <Feather name={feature.icon} size={18} color={Colors.accent} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="font-sans-semibold text-sm text-text-primary">{feature.title}</Text>
                  <Text className="font-sans text-xs text-text-secondary">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-4">
          <Button label="Get Started" onPress={() => router.push("/register")} />
          <Text className="text-center font-sans text-xs text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-sans-medium text-accent">
              Log in
            </Link>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
