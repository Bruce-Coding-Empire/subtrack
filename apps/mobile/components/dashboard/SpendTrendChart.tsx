import { Dimensions, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { Colors } from "@/constants/colors";
import { formatCompactAmount, formatMonthLabel } from "@/lib/format";
import type { SpendTrendPoint } from "@/lib/types";

type Props = {
  points: SpendTrendPoint[];
};

// react-native-chart-kit's chartConfig colors take an rgba function (needed
// for the shadow-fill opacity ramp under the line) rather than web Recharts'
// plain CSS variable strings, so the accent hex token is expanded here once.
function accentRgba(opacity: number): string {
  return `rgba(15, 157, 120, ${opacity})`;
}

function textMutedRgba(opacity: number): string {
  return `rgba(148, 163, 156, ${opacity})`;
}

export function SpendTrendChart({ points }: Props) {
  const hasData = points.length > 0 && points.some((point) => point.amount > 0);

  if (!hasData) {
    return <Text className="py-16 text-center font-sans text-sm text-text-muted">No spend history yet.</Text>;
  }

  return (
    <LineChart
      data={{
        labels: points.map((point) => formatMonthLabel(point.month)),
        datasets: [{ data: points.map((point) => point.amount) }],
      }}
      width={Dimensions.get("window").width - 64}
      height={220}
      chartConfig={{
        backgroundGradientFrom: Colors.surface,
        backgroundGradientTo: Colors.surface,
        decimalPlaces: 0,
        color: accentRgba,
        labelColor: textMutedRgba,
        propsForBackgroundLines: { strokeDasharray: "4, 4", stroke: Colors.borderLight },
        fillShadowGradientFrom: Colors.accent,
        fillShadowGradientFromOpacity: 0.15,
        fillShadowGradientTo: Colors.accent,
        fillShadowGradientToOpacity: 0,
        propsForLabels: { fontSize: 11 },
      }}
      formatYLabel={(value) => formatCompactAmount(Number(value))}
      bezier
      withDots={false}
      withOuterLines={false}
      fromZero
      style={{ marginLeft: -16, borderRadius: 0 }}
    />
  );
}
