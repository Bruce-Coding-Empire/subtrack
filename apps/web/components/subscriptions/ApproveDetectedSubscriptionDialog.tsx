"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriptionForm, type SubscriptionFormValues } from "@/components/subscriptions/SubscriptionForm";
import { approveDetectedSubscription } from "@/lib/detected-subscriptions";
import type { DetectedSubscription, Subscription } from "@/types";

type Props = {
  detected: DetectedSubscription;
  onApproved: (id: string, subscription: Subscription) => void;
};

export function ApproveDetectedSubscriptionDialog({ detected, onApproved }: Props) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(values: SubscriptionFormValues) {
    setFormError(null);
    const result = await approveDetectedSubscription(detected.id, {
      name: values.name,
      cost: values.cost,
      currency: values.currency,
      billingCycle: values.billingCycle,
      customIntervalDays: values.billingCycle === "custom" ? (values.customIntervalDays ?? null) : null,
      category: values.category,
      startDate: values.startDate,
    });

    if (!result.success || !result.data) {
      setFormError(result.error ?? "Failed to approve — please try again");
      return;
    }

    setOpen(false);
    onApproved(detected.id, result.data);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFormError(null);
      }}
    >
      <Button
        type="button"
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-accent text-accent-foreground hover:bg-accent-dark"
      >
        Approve
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Detected Subscription</DialogTitle>
        </DialogHeader>
        <SubscriptionForm
          defaultValues={{
            name: detected.vendorName ?? "",
            cost: detected.amount ?? 0,
            currency: detected.currency ?? "USD",
            billingCycle: detected.billingCycle ?? "monthly",
            customIntervalDays: undefined,
            category: "entertainment",
            startDate: detected.receivedAt
              ? detected.receivedAt.slice(0, 10)
              : new Date().toISOString().slice(0, 10),
          }}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Approve & Add Subscription"
          formError={formError}
        />
      </DialogContent>
    </Dialog>
  );
}
