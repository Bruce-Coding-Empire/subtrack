"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/notifications";
import type { NotificationPreferences } from "@/types";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Notifications</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading notification preferences…</p>
        ) : loadError || !preferences ? (
          <p className="text-sm text-error">{loadError ?? "Failed to load notification preferences"}</p>
        ) : (
          <>
            {NOTIFICATION_TOGGLES.map((toggle) => (
              <div key={toggle.id} className="flex items-center justify-between">
                <label htmlFor={toggle.id} className="text-sm font-medium text-text-primary">
                  {toggle.label}
                </label>
                <Switch
                  id={toggle.id}
                  checked={preferences[toggle.id]}
                  disabled={savingId === toggle.id}
                  onCheckedChange={(checked) => handleToggle(toggle.id, checked)}
                />
              </div>
            ))}
            {saveError && (
              <p role="alert" className="text-xs text-error">
                {saveError}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
