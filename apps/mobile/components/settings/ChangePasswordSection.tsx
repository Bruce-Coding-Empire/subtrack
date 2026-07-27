import { useState } from "react";
import { Text } from "react-native";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { changePassword } from "@/lib/users";

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;

export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const result = changePasswordFormSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
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
    const response = await changePassword({
      currentPassword: result.data.currentPassword,
      newPassword: result.data.newPassword,
    });
    setIsSubmitting(false);

    if (response.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setFormError(response.error ?? "Failed to change password — please try again");
    }
  }

  return (
    <Card className="gap-4">
      <Text className="font-sans-semibold text-base text-text-primary">Change Password</Text>

      <PasswordInput
        label="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        error={fieldErrors.currentPassword}
        autoComplete="current-password"
        textContentType="password"
      />

      <PasswordInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        error={fieldErrors.newPassword}
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <PasswordInput
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
        textContentType="newPassword"
      />

      {formError ? (
        <Text accessibilityRole="alert" className="text-xs text-error">
          {formError}
        </Text>
      ) : null}

      <Button
        label={isSubmitting ? "Updating…" : "Update Password"}
        loading={isSubmitting}
        onPress={handleSubmit}
        className="self-end px-6"
      />
    </Card>
  );
}
