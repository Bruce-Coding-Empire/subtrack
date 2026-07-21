"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriptionForm, type SubscriptionFormValues } from "@/components/subscriptions/SubscriptionForm";
import { updateSubscription } from "@/lib/subscriptions";
import type { Subscription } from "@/types";

type Props = {
  subscription: Subscription;
  onSaved: (subscription: Subscription) => void;
};

export function EditSubscriptionDialog({ subscription, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(values: SubscriptionFormValues) {
    setFormError(null);
    const result = await updateSubscription(subscription.id, {
      name: values.name,
      cost: values.cost,
      currency: values.currency,
      billingCycle: values.billingCycle,
      customIntervalDays: values.billingCycle === "custom" ? (values.customIntervalDays ?? null) : null,
      category: values.category,
      startDate: values.startDate,
    });

    if (!result.success || !result.data) {
      setFormError(result.error ?? "Failed to save changes — please try again");
      return;
    }

    setOpen(false);
    onSaved(result.data);
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
        onClick={() => setOpen(true)}
        className="border-accent bg-surface text-accent hover:bg-accent-light"
      >
        <Pencil className="size-4" />
        Edit
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        <SubscriptionForm
          defaultValues={{
            name: subscription.name,
            cost: subscription.cost,
            currency: subscription.currency,
            billingCycle: subscription.billingCycle,
            customIntervalDays: subscription.customIntervalDays ?? undefined,
            category: subscription.category,
            startDate: subscription.startDate,
          }}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Save Changes"
          formError={formError}
        />
      </DialogContent>
    </Dialog>
  );
}
