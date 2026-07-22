import { Text } from "react-native";

import { Card } from "@/components/ui/Card";

type Props = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: Props) {
  return (
    <Card className="flex-1 gap-1">
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        className="font-sans-semibold text-[26px] leading-8 text-text-primary"
      >
        {value}
      </Text>
      <Text className="font-sans text-xs text-text-muted">{label}</Text>
    </Card>
  );
}
