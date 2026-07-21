"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteSubscription } from "@/lib/subscriptions";

type Props = {
  subscriptionId: string;
  onDeleted: () => void;
};

export function DeleteSubscriptionDialog({ subscriptionId, onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    const result = await deleteSubscription(subscriptionId);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to delete subscription — please try again");
      return;
    }

    setOpen(false);
    onDeleted();
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <Button variant="outline" onClick={() => setOpen(true)} className="border-border bg-error text-white hover:bg-error/90">
        <Trash2 className="size-4" />
        Delete
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this subscription?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes it. This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep Subscription
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="bg-error text-white hover:bg-error/90">
            {isSubmitting ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
