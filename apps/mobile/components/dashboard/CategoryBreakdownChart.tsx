import { Dimensions, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

import { Colors } from "@/constants/colors";
import { CATEGORY_CHART_COLORS, CATEGORY_OPTIONS } from "@/lib/subscription-options";
import type { CategoryBreakdownEntry } from "@/lib/types";

type Props = {
  data: CategoryBreakdownEntry[];
};

function categoryLabel(category: CategoryBreakdownEntry["category"]): string {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;
}

export function CategoryBreakdownChart({ data }: Props) {
  if (data.length === 0) {
    return <Text className="py-16 text-center font-sans text-sm text-text-muted">No category spend yet.</Text>;
  }

  const chartData = data.map((entry) => ({
    name: entry.category,
    amount: entry.amount,
    color: CATEGORY_CHART_COLORS[entry.category],
    legendFontColor: Colors.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <View className="gap-3">
      <PieChart
        data={chartData}
        width={Dimensions.get("window").width - 64}
        height={180}
        chartConfig={{ color: () => Colors.textPrimary }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="8"
        hasLegend={false}
      />

      <View className="gap-2">
        {data.map((entry) => (
          <View key={entry.category} className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_CHART_COLORS[entry.category] }} />
            <Text className="font-sans text-sm text-text-primary">{categoryLabel(entry.category)}</Text>
            <Text className="ml-auto font-sans text-sm text-text-muted">{entry.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
