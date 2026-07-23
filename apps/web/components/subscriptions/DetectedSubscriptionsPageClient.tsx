"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailSearch } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { DetectedSubscriptionRow } from "@/components/subscriptions/DetectedSubscriptionRow";
import { cn } from "@/lib/utils";
import { listDetectedSubscriptions } from "@/lib/detected-subscriptions";
import type { DetectedSubscription } from "@/types";

export function DetectedSubscriptionsPageClient() {
  const [pending, setPending] = useState<DetectedSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      const result = await listDetectedSubscriptions();
      if (cancelled) return;

      if (result.success && result.data) {
        setPending(result.data.items);
      } else {
        setError(result.error ?? "Failed to load detected subscriptions — please try again");
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleApproved(id: string) {
    setPending((current) => current.filter((detected) => detected.id !== id));
  }

  function handleDismissed(id: string) {
    setPending((current) => current.filter((detected) => detected.id !== id));
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
      <div className="flex flex-col gap-1">
        <Link href="/subscriptions" className="text-xs font-medium text-text-secondary hover:text-text-primary">
          ← Back to Subscriptions
        </Link>
        <h1 className="text-base font-semibold text-text-primary">Detected Subscriptions</h1>
        <p className="text-sm text-text-muted">
          Found in your connected inbox. Approve to add them to your subscriptions, or dismiss if they aren&apos;t
          recurring.
        </p>
      </div>

      <Card>
        <CardContent>
          {error ? (
            <p className="py-16 text-center text-sm text-error">{error}</p>
          ) : isLoading ? (
            <p className="py-16 text-center text-sm text-text-muted">Loading detected subscriptions…</p>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <MailSearch className="size-8 text-text-muted" />
              <p className="text-sm text-text-muted">No detected subscriptions waiting for review.</p>
              <Link
                href="/settings"
                className={cn(buttonVariants(), "border-accent bg-surface text-accent hover:bg-accent-light")}
              >
                Manage Gmail connection
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {pending.map((detected) => (
                <DetectedSubscriptionRow
                  key={detected.id}
                  detected={detected}
                  onApproved={handleApproved}
                  onDismissed={handleDismissed}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
