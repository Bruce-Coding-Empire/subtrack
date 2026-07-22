import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useSession } from "@/lib/auth-context";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FieldErrors = Partial<Record<"email" | "password", string>>;

export default function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const result = loginSchema.safeParse({ email, password });
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
    const response = await signIn(result.data.email, result.data.password);
    setIsSubmitting(false);

    if (!response.success) {
      setFormError(response.error ?? "Unable to log in — please try again");
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
            <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-accent">
              <Text className="font-sans-bold text-sm text-accent-foreground">S</Text>
            </View>
            <Text className="font-sans-bold text-lg text-text-primary">SubTrack</Text>
          </View>

          <View className="w-full max-w-sm gap-4 rounded-2xl border border-border bg-surface p-4">
            <View className="gap-1">
              <Text className="font-sans-semibold text-base text-text-primary">Log In</Text>
              <Text className="font-sans text-xs text-text-secondary">
                Welcome back — enter your details to continue.
              </Text>
            </View>

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
              autoComplete="current-password"
              textContentType="password"
            />

            {formError ? (
              <Text accessibilityRole="alert" className="text-xs text-error">
                {formError}
              </Text>
            ) : null}

            <Button
              label={isSubmitting ? "Logging in…" : "Log In"}
              loading={isSubmitting}
              onPress={handleSubmit}
            />

            <Text className="text-center font-sans text-xs text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-sans-medium text-accent">
                Register
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
