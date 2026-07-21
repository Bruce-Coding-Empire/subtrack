"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/subscriptions/CategoryBadge";
import { StatusBadge } from "@/components/subscriptions/StatusBadge";
import { RenewalUrgencyPill } from "@/components/subscriptions/RenewalUrgencyPill";
import { PaymentHistoryList } from "@/components/subscriptions/PaymentHistoryList";
import { EditSubscriptionDialog } from "@/components/subscriptions/EditSubscriptionDialog";
import { CancelSubscriptionDialog } from "@/components/subscriptions/CancelSubscriptionDialog";
import { DeleteSubscriptionDialog } from "@/components/subscriptions/DeleteSubscriptionDialog";
import { formatBillingCycle, formatCurrency, formatDate } from "@/lib/format";
import { getSubscription } from "@/lib/subscriptions";
import type { SubscriptionDetail } from "@/types";

type Props = {
  id: string;
};

export function SubscriptionDetailClient({ id }: Props) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      const result = await getSubscription(id);
      if (cancelled) return;

      if (result.success && result.data) {
        setSubscription(result.data);
        document.title = `${result.data.name} - SubTrack`;
      } else if (result.error === "Subscription not found") {
        setIsNotFound(true);
      } else {
        setError(result.error ?? "Failed to load subscription — please try again");
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isNotFound) {
    notFound();
  }

  if (isLoading) {
    return <p className="mx-auto w-full max-w-7xl p-8 text-center text-sm text-text-muted">Loading subscription…</p>;
  }

  if (error || !subscription) {
    return (
      <p className="mx-auto w-full max-w-7xl p-8 text-center text-sm text-error">
        {error ?? "Subscription not found"}
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
      <Link
        href="/subscriptions"
        className="flex w-fit items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to Subscriptions
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-base font-semibold text-text-primary">{subscription.name}</h1>
          <CategoryBadge category={subscription.category} />
          <StatusBadge status={subscription.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EditSubscriptionDialog
            subscription={subscription}
            onSaved={(updated) => setSubscription((current) => (current ? { ...current, ...updated } : current))}
          />
          {subscription.status === "active" && (
            <CancelSubscriptionDialog
              subscriptionId={subscription.id}
              onCancelled={(updated) =>
                setSubscription((current) => (current ? { ...current, ...updated } : current))
              }
            />
          )}
          <DeleteSubscriptionDialog subscriptionId={subscription.id} onDeleted={() => router.push("/subscriptions")} />
        </div>
      </div>

      <Card>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-text-muted">Cost</dt>
              <dd className="text-sm text-text-primary">{formatCurrency(subscription.cost, subscription.currency)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-text-muted">Cycle</dt>
              <dd className="text-sm text-text-primary">{formatBillingCycle(subscription)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-text-muted">Start Date</dt>
              <dd className="text-sm text-text-primary">{formatDate(subscription.startDate)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-text-muted">Next Renewal</dt>
              <dd>
                <RenewalUrgencyPill nextRenewalDate={subscription.nextRenewalDate} />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryList paymentHistory={subscription.paymentHistory} />
        </CardContent>
      </Card>
    </div>
  );
}
