"use client";

import { useState } from "react";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cancelSubscription } from "@/lib/subscriptions";
import type { Subscription } from "@/types";

type Props = {
  subscriptionId: string;
  onCancelled: (subscription: Subscription) => void;
};

export function CancelSubscriptionDialog({ subscriptionId, onCancelled }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    const result = await cancelSubscription(subscriptionId);
    setIsSubmitting(false);

    if (!result.success || !result.data) {
      setError(result.error ?? "Failed to cancel subscription — please try again");
      return;
    }

    setOpen(false);
    onCancelled(result.data);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <Button onClick={() => setOpen(true)} className="border-error bg-surface text-error hover:bg-error-light">
        <Ban className="size-4" />
        Cancel Subscription
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            It will stop renewing and be excluded from your dashboard totals, but stays visible in your
            subscriptions list under the Cancelled filter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <Button onClick={() => setOpen(false)} className="border-accent bg-surface text-accent hover:bg-accent-light">
            Keep Subscription
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="bg-error text-white hover:bg-error/90">
            {isSubmitting ? "Cancelling…" : "Cancel Subscription"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
