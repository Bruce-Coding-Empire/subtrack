import { BILLING_CYCLE_LABELS } from "@/lib/subscription-options";
import type { Subscription } from "@/lib/types";

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function formatBillingCycle(subscription: Pick<Subscription, "billingCycle" | "customIntervalDays">): string {
  if (subscription.billingCycle === "custom") {
    return `Every ${subscription.customIntervalDays} days`;
  }
  return BILLING_CYCLE_LABELS[subscription.billingCycle];
}
