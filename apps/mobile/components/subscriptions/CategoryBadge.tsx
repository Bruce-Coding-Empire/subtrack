import { Text, View } from "react-native";

import { CATEGORY_BADGE_CLASSES, CATEGORY_OPTIONS } from "@/lib/subscription-options";
import type { SubscriptionCategory } from "@/lib/types";

type Props = {
  category: SubscriptionCategory;
};

export function CategoryBadge({ category }: Props) {
  const label = CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;

  const colorClasses = CATEGORY_BADGE_CLASSES[category];

  return (
    <View className={`self-start rounded-full px-2 py-0.5 ${colorClasses}`}>
      <Text className={`font-sans-medium text-xs ${colorClasses}`}>{label}</Text>
    </View>
  );
}
