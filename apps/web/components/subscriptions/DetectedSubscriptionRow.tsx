"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApproveDetectedSubscriptionDialog } from "@/components/subscriptions/ApproveDetectedSubscriptionDialog";
import { dismissDetectedSubscription } from "@/lib/detected-subscriptions";
import { BILLING_CYCLE_LABELS } from "@/lib/subscription-options";
import { formatCurrency, formatDate } from "@/lib/format";
import type { DetectedSubscription, Subscription } from "@/types";

type Props = {
  detected: DetectedSubscription;
  onApproved: (id: string, subscription: Subscription) => void;
  onDismissed: (id: string) => void;
};

export function DetectedSubscriptionRow({ detected, onApproved, onDismissed }: Props) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDismiss() {
    setIsDismissing(true);
    setError(null);
    const result = await dismissDetectedSubscription(detected.id);
    setIsDismissing(false);

    if (!result.success) {
      setError(result.error ?? "Failed to dismiss — please try again");
      return;
    }

    onDismissed(detected.id);
  }

  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{detected.vendorName ?? "Unknown vendor"}</span>
          {detected.billingCycle ? (
            <Badge variant="outline" className="border-transparent bg-surface-secondary text-text-secondary">
              {BILLING_CYCLE_LABELS[detected.billingCycle]}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-transparent bg-warning-light text-warning-foreground">
              Cycle unknown
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-text-muted">{detected.rawSubject}</p>
        {error && (
          <p role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-text-primary">
            {detected.amount !== null && detected.currency
              ? formatCurrency(detected.amount, detected.currency)
              : "Amount not detected"}
          </span>
          {detected.receivedAt && (
            <span className="text-xs text-text-muted">{formatDate(detected.receivedAt.slice(0, 10))}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleDismiss}
            disabled={isDismissing}
            className="border-accent bg-surface text-accent hover:bg-accent-light"
          >
            {isDismissing ? "Dismissing…" : "Dismiss"}
          </Button>
          <ApproveDetectedSubscriptionDialog detected={detected} onApproved={onApproved} />
        </div>
      </div>
    </li>
  );
}
