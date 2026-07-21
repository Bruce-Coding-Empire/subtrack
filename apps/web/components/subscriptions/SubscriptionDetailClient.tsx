"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/subscriptions/CategoryBadge";
import { StatusBadge } from "@/components/subscriptions/StatusBadge";
import { RenewalUrgencyPill } from "@/components/subscriptions/RenewalUrgencyPill";
import { PaymentHistoryList } from "@/components/subscriptions/PaymentHistoryList";
import { EditSubscriptionDialog } from "@/components/subscriptions/EditSubscriptionDialog";
import type { SubscriptionFormValues } from "@/components/subscriptions/SubscriptionForm";
import { formatBillingCycle, formatCurrency, formatDate } from "@/lib/format";
import type { SubscriptionDetail } from "@/types";

type Props = {
  subscription: SubscriptionDetail;
};

export function SubscriptionDetailClient({ subscription: initialSubscription }: Props) {
  const [subscription, setSubscription] = useState(initialSubscription);

  function handleSave(values: SubscriptionFormValues) {
    setSubscription((current) => ({
      ...current,
      name: values.name,
      cost: values.cost,
      currency: values.currency,
      billingCycle: values.billingCycle,
      customIntervalDays: values.billingCycle === "custom" ? (values.customIntervalDays ?? null) : null,
      category: values.category,
      startDate: values.startDate,
    }));
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
      <Link href="/subscriptions" className="flex w-fit items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary">
        <ArrowLeft className="size-4" />
        Back to Subscriptions
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-base font-semibold text-text-primary">{subscription.name}</h1>
          <CategoryBadge category={subscription.category} />
          <StatusBadge status={subscription.status} />
        </div>
        <EditSubscriptionDialog subscription={subscription} onSave={handleSave} />
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
