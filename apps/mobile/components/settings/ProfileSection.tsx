import { useState } from "react";
import { Text } from "react-native";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/SelectField";
import { CURRENCY_OPTIONS } from "@/lib/subscription-options";
import { updateCurrentUserProfile } from "@/lib/users";
import type { UserProfile } from "@/lib/types";

const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  baseCurrency: z.string().min(1, "Select a currency"),
});

type FieldErrors = Partial<Record<"name" | "baseCurrency", string>>;

type Props = {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
};

export function ProfileSection({ profile, onSaved }: Props) {
  const [name, setName] = useState(profile.name);
  const [baseCurrency, setBaseCurrency] = useState(profile.baseCurrency);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = name !== profile.name || baseCurrency !== profile.baseCurrency;

  async function handleSubmit() {
    const result = profileFormSchema.safeParse({ name, baseCurrency });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        errors[issue.path[0] as keyof FieldErrors] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);
    const response = await updateCurrentUserProfile(result.data);
    setIsSubmitting(false);

    if (response.success && response.data) {
      onSaved(response.data);
    } else {
      setFormError(response.error ?? "Failed to save profile — please try again");
    }
  }

  return (
    <Card className="gap-4">
      <Text className="font-sans-semibold text-base text-text-primary">Profile</Text>

      <Input label="Name" value={name} onChangeText={setName} error={fieldErrors.name} />

      <Input label="Email" value={profile.email} editable={false} className="opacity-60" />

      <SelectField
        label="Base Currency"
        value={baseCurrency}
        options={CURRENCY_OPTIONS.map((currency) => ({ value: currency, label: currency }))}
        onChange={setBaseCurrency}
        error={fieldErrors.baseCurrency}
      />

      {formError ? (
        <Text accessibilityRole="alert" className="text-xs text-error">
          {formError}
        </Text>
      ) : null}

      <Button
        label={isSubmitting ? "Saving…" : "Save Changes"}
        loading={isSubmitting}
        disabled={!isDirty}
        onPress={handleSubmit}
        className="self-end px-6"
      />
    </Card>
  );
}
