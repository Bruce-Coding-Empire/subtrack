import { forwardRef, useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { Colors } from "@/constants/colors";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, onFocus, onBlur, className, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error ? "border-error" : isFocused ? "border-accent" : "border-border";

  return (
    <View className="gap-1">
      <Text className="font-sans-medium text-sm text-text-primary">{label}</Text>
      <TextInput
        ref={ref}
        className={`rounded-md border bg-surface px-3 py-2 font-sans text-sm text-text-primary ${borderClass} ${className ?? ""}`}
        placeholderTextColor={Colors.textMuted}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        {...props}
      />
      {error ? <Text className="text-xs text-error">{error}</Text> : null}
    </View>
  );
});
