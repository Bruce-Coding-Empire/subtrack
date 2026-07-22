import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  error?: string;
};

export function SelectField<T extends string>({ label, value, options, onChange, error }: Props<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  const borderClass = error ? "border-error" : "border-border";

  return (
    <View className="gap-1">
      <Text className="font-sans-medium text-sm text-text-primary">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className={`flex-row items-center justify-between rounded-md border bg-surface px-3 py-2 ${borderClass}`}
      >
        <Text className="font-sans text-sm text-text-primary">{selectedLabel}</Text>
        <Feather name="chevron-down" size={16} color={Colors.textMuted} />
      </Pressable>
      {error ? <Text className="text-xs text-error">{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[70%]" onPress={(event) => event.stopPropagation()}>
            <SafeAreaView edges={["bottom"]} className="rounded-t-2xl bg-surface">
              <View className="items-center border-b border-border px-4 py-3">
                <Text className="font-sans-semibold text-base text-text-primary">{label}</Text>
              </View>
              <FlatList
                data={options}
                keyExtractor={(option) => option.value}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between border-b border-border-light px-4 py-3"
                  >
                    <Text
                      className={
                        item.value === value
                          ? "font-sans-medium text-sm text-accent"
                          : "font-sans text-sm text-text-primary"
                      }
                    >
                      {item.label}
                    </Text>
                    {item.value === value ? <Feather name="check" size={16} color={Colors.accent} /> : null}
                  </Pressable>
                )}
              />
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
