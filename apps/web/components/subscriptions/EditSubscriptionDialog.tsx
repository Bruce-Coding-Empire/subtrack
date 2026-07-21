"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriptionForm, type SubscriptionFormValues } from "@/components/subscriptions/SubscriptionForm";
import type { Subscription } from "@/types";

type Props = {
  subscription: Subscription;
  onSave: (values: SubscriptionFormValues) => void;
};

export function EditSubscriptionDialog({ subscription, onSave }: Props) {
  const [open, setOpen] = useState(false);

  function handleSubmit(values: SubscriptionFormValues) {
    onSave(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
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
        />
      </DialogContent>
    </Dialog>
  );
}
