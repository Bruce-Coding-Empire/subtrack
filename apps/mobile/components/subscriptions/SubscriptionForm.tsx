import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/SelectField";
import { BILLING_CYCLE_OPTIONS, CATEGORY_OPTIONS, CURRENCY_OPTIONS } from "@/lib/subscription-options";
import type { BillingCycle, SubscriptionCategory } from "@/lib/types";

const subscriptionFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
    cost: z.number("Cost must be a number").positive("Cost must be greater than 0"),
    currency: z.string().min(1, "Select a currency"),
    billingCycle: z.enum(["weekly", "monthly", "yearly", "custom"]),
    customIntervalDays: z.number().int().positive().optional(),
    category: z.enum(["entertainment", "software", "fitness", "utilities", "other"]),
    startDate: z.string().min(1, "Start date is required"),
  })
  .superRefine((values, ctx) => {
    if (values.billingCycle === "custom" && !values.customIntervalDays) {
      ctx.addIssue({
        code: "custom",
        path: ["customIntervalDays"],
        message: "Enter the number of days between renewals",
      });
    }
  });

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

type FormState = {
  name: string;
  cost: string;
  currency: string;
  billingCycle: BillingCycle;
  customIntervalDays: string;
  category: SubscriptionCategory;
  startDate: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type Props = {
  defaultValues?: Partial<FormState>;
  onSubmit: (values: SubscriptionFormValues) => void | Promise<void>;
  submitLabel: string;
  formError?: string | null;
};

export function SubscriptionForm({ defaultValues, onSubmit, submitLabel, formError }: Props) {
  const [values, setValues] = useState<FormState>({
    name: "",
    cost: "",
    currency: "USD",
    billingCycle: "monthly",
    customIntervalDays: "",
    category: "entertainment",
    startDate: "",
    ...defaultValues,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    const candidate = {
      name: values.name,
      cost: Number(values.cost),
      currency: values.currency,
      billingCycle: values.billingCycle,
      customIntervalDays:
        values.billingCycle === "custom" && values.customIntervalDays
          ? Number(values.customIntervalDays)
          : undefined,
      category: values.category,
      startDate: values.startDate,
    };

    const result = subscriptionFormSchema.safeParse(candidate);
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
    setIsSubmitting(true);
    await onSubmit(result.data);
    setIsSubmitting(false);
  }

  return (
    <View className="gap-4">
      <Input
        label="Name"
        placeholder="Netflix"
        value={values.name}
        onChangeText={(text) => setField("name", text)}
        error={fieldErrors.name}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input
            label="Cost"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={values.cost}
            onChangeText={(text) => setField("cost", text)}
            error={fieldErrors.cost}
          />
        </View>
        <View className="flex-1">
          <SelectField
            label="Currency"
            value={values.currency}
            options={CURRENCY_OPTIONS.map((currency) => ({ value: currency, label: currency }))}
            onChange={(value) => setField("currency", value)}
            error={fieldErrors.currency}
          />
        </View>
      </View>

      <View className="gap-1">
        <Text className="font-sans-medium text-sm text-text-primary">Billing Cycle</Text>
        <View className="flex-row items-center gap-1 rounded-md border border-border bg-surface p-1">
          {BILLING_CYCLE_OPTIONS.map((option) => {
            const isActive = values.billingCycle === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  setField("billingCycle", option.value);
                  if (option.value === "custom" && !values.customIntervalDays) {
                    setField("customIntervalDays", "30");
                  }
                }}
                className={`flex-1 items-center rounded-md px-2 py-1.5 ${isActive ? "bg-accent" : ""}`}
              >
                <Text
                  className={`font-sans-medium text-xs ${isActive ? "text-accent-foreground" : "text-text-secondary"}`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {fieldErrors.billingCycle ? <Text className="text-xs text-error">{fieldErrors.billingCycle}</Text> : null}
      </View>

      {values.billingCycle === "custom" && (
        <Input
          label="Every N Days"
          placeholder="30"
          keyboardType="number-pad"
          value={values.customIntervalDays}
          onChangeText={(text) => setField("customIntervalDays", text.replace(/\D/g, ""))}
          error={fieldErrors.customIntervalDays}
        />
      )}

      <SelectField
        label="Category"
        value={values.category}
        options={CATEGORY_OPTIONS}
        onChange={(value) => setField("category", value)}
        error={fieldErrors.category}
      />

      <DateField
        label="Start Date"
        value={values.startDate}
        onChange={(value) => setField("startDate", value)}
        error={fieldErrors.startDate}
      />

      {formError ? (
        <Text accessibilityRole="alert" className="text-xs text-error">
          {formError}
        </Text>
      ) : null}

      <Button label={isSubmitting ? "Saving…" : submitLabel} loading={isSubmitting} onPress={handleSubmit} />
    </View>
  );
}
