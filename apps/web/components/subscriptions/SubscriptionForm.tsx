"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BILLING_CYCLE_OPTIONS,
  CATEGORY_OPTIONS,
  CURRENCY_OPTIONS,
} from "@/lib/subscription-options";

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

type Props = {
  defaultValues?: Partial<SubscriptionFormValues>;
  onSubmit: (values: SubscriptionFormValues) => void;
  onCancel?: () => void;
  submitLabel: string;
};

export function SubscriptionForm({ defaultValues, onSubmit, onCancel, submitLabel }: Props) {
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      cost: 0,
      currency: "USD",
      billingCycle: "monthly",
      customIntervalDays: undefined,
      category: "entertainment",
      startDate: "",
      ...defaultValues,
    },
  });

  const billingCycle = useWatch({ control: form.control, name: "billingCycle" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Netflix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={Number.isNaN(field.value) ? "" : field.value}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="billingCycle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Cycle</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1">
                  {BILLING_CYCLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        field.onChange(option.value);
                        if (option.value === "custom" && !form.getValues("customIntervalDays")) {
                          form.setValue("customIntervalDays", 30);
                        }
                      }}
                      className={cn(
                        "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        field.value === option.value
                          ? "bg-accent text-accent-foreground"
                          : "text-text-secondary hover:bg-surface-secondary",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {billingCycle === "custom" && (
          <FormField
            control={form.control}
            name="customIntervalDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Every N Days</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category">
                      {(value: string) => CATEGORY_OPTIONS.find((option) => option.value === value)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent-dark">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
