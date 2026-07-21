"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriptionForm, type SubscriptionFormValues } from "@/components/subscriptions/SubscriptionForm";
import { createSubscription } from "@/lib/subscriptions";

type Props = {
  onCreated: () => void;
};

export function AddSubscriptionDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(values: SubscriptionFormValues) {
    setFormError(null);
    const result = await createSubscription({
      name: values.name,
      cost: values.cost,
      currency: values.currency,
      billingCycle: values.billingCycle,
      customIntervalDays: values.billingCycle === "custom" ? (values.customIntervalDays ?? null) : null,
      category: values.category,
      startDate: values.startDate,
    });

    if (!result.success) {
      setFormError(result.error ?? "Failed to create subscription — please try again");
      return;
    }

    setOpen(false);
    onCreated();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFormError(null);
      }}
    >
      <Button onClick={() => setOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent-dark">
        <Plus className="size-4" />
        Add Subscription
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>
        <SubscriptionForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel="Add Subscription"
          formError={formError}
        />
      </DialogContent>
    </Dialog>
  );
}
