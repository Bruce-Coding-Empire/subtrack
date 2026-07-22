import { forwardRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Input } from "@/components/ui/Input";

type Props = React.ComponentProps<typeof Input>;

export const PasswordInput = forwardRef<TextInput, Props>(function PasswordInput(props, ref) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View>
      <Input ref={ref} secureTextEntry={!isVisible} className="pr-14" {...props} />
      <Pressable
        onPress={() => setIsVisible((value) => !value)}
        hitSlop={8}
        className="absolute right-3 top-9 py-1"
        accessibilityRole="button"
        accessibilityLabel={isVisible ? "Hide password" : "Show password"}
      >
        <Text className="font-sans-medium text-xs text-accent">{isVisible ? "Hide" : "Show"}</Text>
      </Pressable>
    </View>
  );
});
