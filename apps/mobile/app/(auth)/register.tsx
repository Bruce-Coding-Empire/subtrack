import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useSession } from "@/lib/auth-context";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

export default function RegisterScreen() {
  const { signUp } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const result = registerSchema.safeParse({ name, email, password });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);
    const response = await signUp(result.data.name, result.data.email, result.data.password);
    setIsSubmitting(false);

    if (!response.success) {
      setFormError(response.error ?? "Unable to create your account — please try again");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-1 items-center justify-center gap-8 px-4 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-2">
            <Image
              source={require("@/assets/images/subtrack.png")}
              style={{ width: 36, height: 36 }}
              contentFit="contain"
            />
            <Text className="font-sans-bold text-lg text-text-primary">SubTrack</Text>
          </View>

          <View className="w-full max-w-sm gap-4 rounded-2xl border border-border bg-surface p-4">
            <View className="gap-1">
              <Text className="font-sans-semibold text-base text-text-primary">Create Account</Text>
              <Text className="font-sans text-xs text-text-secondary">
                Start tracking your subscriptions in one place.
              </Text>
            </View>

            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              error={fieldErrors.name}
              autoComplete="name"
              textContentType="name"
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={fieldErrors.email}
              autoComplete="email"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={fieldErrors.password}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            {formError ? (
              <Text accessibilityRole="alert" className="text-xs text-error">
                {formError}
              </Text>
            ) : null}

            <Button
              label={isSubmitting ? "Creating account…" : "Create Account"}
              loading={isSubmitting}
              onPress={handleSubmit}
            />

            <Text className="text-center font-sans text-xs text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="font-sans-medium text-accent">
                Log in
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
