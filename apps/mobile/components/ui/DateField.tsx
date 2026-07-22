import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/colors";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function toDateValue(value: string): Date {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplay(value: string): string {
  if (!value) return "Select date";
  return toDateValue(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DateField({ label, value, onChange, error }: Props) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(toDateValue(value));

  const borderClass = error ? "border-error" : "border-border";

  function handlePress() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: toDateValue(value),
        mode: "date",
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            onChange(toDateString(selectedDate));
          }
        },
      });
      return;
    }

    setDraftDate(toDateValue(value));
    setIosPickerOpen(true);
  }

  return (
    <View className="gap-1">
      <Text className="font-sans-medium text-sm text-text-primary">{label}</Text>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        className={`flex-row items-center justify-between rounded-md border bg-surface px-3 py-2 ${borderClass}`}
      >
        <Text className={`font-sans text-sm ${value ? "text-text-primary" : "text-text-muted"}`}>
          {formatDisplay(value)}
        </Text>
        <Feather name="calendar" size={16} color={Colors.textMuted} />
      </Pressable>
      {error ? <Text className="text-xs text-error">{error}</Text> : null}

      {Platform.OS === "ios" && (
        <Modal
          visible={iosPickerOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIosPickerOpen(false)}
        >
          <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setIosPickerOpen(false)}>
            <Pressable onPress={(event) => event.stopPropagation()}>
              <SafeAreaView edges={["bottom"]} className="rounded-t-2xl bg-surface">
                <View className="items-center border-b border-border px-4 py-3">
                  <Text className="font-sans-semibold text-base text-text-primary">{label}</Text>
                </View>
                <DateTimePicker
                  value={draftDate}
                  mode="date"
                  display="inline"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setDraftDate(selectedDate);
                  }}
                />
                <View className="p-4">
                  <Button
                    label="Done"
                    onPress={() => {
                      onChange(toDateString(draftDate));
                      setIosPickerOpen(false);
                    }}
                  />
                </View>
              </SafeAreaView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
