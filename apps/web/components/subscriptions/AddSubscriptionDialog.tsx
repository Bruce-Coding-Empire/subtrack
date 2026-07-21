"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriptionForm, type SubscriptionFormValues } from "@/components/subscriptions/SubscriptionForm";
import type { Subscription } from "@/types";

type Props = {
  onCreate: (subscription: Subscription) => void;
};

export function AddSubscriptionDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);

  function handleSubmit(values: SubscriptionFormValues) {
    const subscription: Subscription = {
      id: crypto.randomUUID(),
      name: values.name,
      cost: values.cost,
      currency: values.currency,
      billingCycle: values.billingCycle,
      customIntervalDays: values.billingCycle === "custom" ? (values.customIntervalDays ?? null) : null,
      category: values.category,
      status: "active",
      startDate: values.startDate,
      nextRenewalDate: values.startDate,
    };

    onCreate(subscription);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent-dark">
        <Plus className="size-4" />
        Add Subscription
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>
        <SubscriptionForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} submitLabel="Add Subscription" />
      </DialogContent>
    </Dialog>
  );
}
