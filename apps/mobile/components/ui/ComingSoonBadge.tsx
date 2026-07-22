import { Text, View } from "react-native";

export function ComingSoonBadge() {
  return (
    <View className="self-start rounded-full bg-info-light px-2 py-0.5">
      <Text className="font-sans-medium text-xs text-info-foreground">Coming in v2</Text>
    </View>
  );
}
