import { View, type ViewProps } from "react-native";

type Props = ViewProps;

export function Card({ className, ...props }: Props) {
  return (
    <View
      className={`rounded-2xl border border-border bg-surface p-4 shadow-sm ${className ?? ""}`}
      {...props}
    />
  );
}
