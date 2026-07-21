import type { BillingCycle, SubscriptionCategory } from "@/types";

export const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "RWF"] as const;

export const CATEGORY_OPTIONS: { value: SubscriptionCategory; label: string }[] = [
  { value: "entertainment", label: "Entertainment" },
  { value: "software", label: "Software" },
  { value: "fitness", label: "Fitness" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

export const CATEGORY_BADGE_CLASSES: Record<SubscriptionCategory, string> = {
  entertainment: "bg-category-entertainment/12 text-category-entertainment",
  software: "bg-category-software/12 text-category-software",
  fitness: "bg-category-fitness/12 text-category-fitness",
  utilities: "bg-category-utilities/12 text-category-utilities",
  other: "bg-category-other/12 text-category-other",
};

export const BILLING_CYCLE_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  custom: "Custom",
};
