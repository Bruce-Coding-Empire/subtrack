import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { Colors } from "@/constants/colors";

type Props = PressableProps & {
  label: string;
  loading?: boolean;
};

export function Button({ label, loading, disabled, className, ...props }: Props) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color={Colors.accentForeground} /> : null}
      <Text className="font-sans-medium text-sm text-accent-foreground">{label}</Text>
    </Pressable>
  );
}
