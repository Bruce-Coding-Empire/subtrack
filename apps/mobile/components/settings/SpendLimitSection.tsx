import { useState } from "react";
import { Text } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { updateCurrentUserProfile } from "@/lib/users";
import type { UserProfile } from "@/lib/types";

type Props = {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
};

function toInputValue(limit: number | null): string {
  return limit === null ? "" : String(limit);
}

export function SpendLimitSection({ profile, onSaved }: Props) {
  const [value, setValue] = useState(toInputValue(profile.monthlySpendLimit));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isNegative = value.trim() !== "" && Number(value) < 0;
  const isDirty = value !== toInputValue(profile.monthlySpendLimit);

  async function handleSave() {
    const monthlySpendLimit = value.trim() === "" ? null : Number(value);
    setIsSaving(true);
    setSaveError(null);
    const result = await updateCurrentUserProfile({ monthlySpendLimit });
    if (result.success && result.data) {
      onSaved(result.data);
    } else {
      setSaveError(result.error ?? "Failed to save spend limit — please try again");
    }
    setIsSaving(false);
  }

  return (
    <Card className="gap-3">
      <Text className="font-sans-semibold text-base text-text-primary">Monthly Spend Limit</Text>

      <Input
        label={`Limit (${profile.baseCurrency})`}
        placeholder="No limit set"
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        error={isNegative ? "Limit must not be negative" : undefined}
      />

      {saveError ? (
        <Text accessibilityRole="alert" className="text-xs text-error">
          {saveError}
        </Text>
      ) : null}

      <Button
        label={isSaving ? "Saving…" : "Save Changes"}
        loading={isSaving}
        disabled={!isDirty || isNegative}
        onPress={handleSave}
        className="self-end px-6"
      />
    </Card>
  );
}
