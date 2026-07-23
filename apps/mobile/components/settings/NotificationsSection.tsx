import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/notifications";
import type { NotificationPreferences } from "@/lib/types";

const NOTIFICATION_TOGGLES: { id: keyof NotificationPreferences; label: string }[] = [
  { id: "renewalRemindersEnabled", label: "Renewal Reminders" },
  { id: "spendLimitAlertsEnabled", label: "Spend Limit Alerts" },
];

export function NotificationsSection() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<keyof NotificationPreferences | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      const result = await getNotificationPreferences();
      if (cancelled) return;

      if (result.success && result.data) {
        setPreferences(result.data);
      } else {
        setLoadError(result.error ?? "Failed to load notification preferences — please try again");
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle(id: keyof NotificationPreferences, checked: boolean) {
    if (!preferences) return;
    const previous = preferences;

    setPreferences({ ...preferences, [id]: checked });
    setSavingId(id);
    setSaveError(null);

    const result = await updateNotificationPreferences({ [id]: checked });
    if (result.success && result.data) {
      setPreferences(result.data);
    } else {
      setPreferences(previous);
      setSaveError(result.error ?? "Failed to update notification preferences — please try again");
    }
    setSavingId(null);
  }

  return (
    <Card className="gap-4">
      <Text className="font-sans-semibold text-base text-text-primary">Notifications</Text>

      {isLoading ? (
        <Text className="font-sans text-sm text-text-muted">Loading notification preferences…</Text>
      ) : loadError || !preferences ? (
        <Text className="font-sans text-sm text-error">
          {loadError ?? "Failed to load notification preferences"}
        </Text>
      ) : (
        <>
          {NOTIFICATION_TOGGLES.map((toggle) => (
            <View key={toggle.id} className="flex-row items-center justify-between">
              <Text className="font-sans-medium text-sm text-text-primary">{toggle.label}</Text>
              <Switch
                value={preferences[toggle.id]}
                disabled={savingId === toggle.id}
                onValueChange={(checked) => handleToggle(toggle.id, checked)}
                trackColor={{ false: Colors.border, true: Colors.accent }}
                thumbColor={Colors.surface}
              />
            </View>
          ))}
          {saveError ? (
            <Text accessibilityRole="alert" className="font-sans text-xs text-error">
              {saveError}
            </Text>
          ) : null}
        </>
      )}
    </Card>
  );
}
