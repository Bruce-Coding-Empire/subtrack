"use client";

import { useRouter } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryBadge } from "@/components/subscriptions/CategoryBadge";
import { StatusBadge } from "@/components/subscriptions/StatusBadge";
import { formatBillingCycle, formatCurrency, formatDate } from "@/lib/format";
import type { Subscription } from "@/types";

type Props = {
  subscriptions: Subscription[];
};

export function SubscriptionsTable({ subscriptions }: Props) {
  const router = useRouter();

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        <p className="text-sm text-text-muted">No subscriptions match your filters.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs font-medium tracking-wide text-text-secondary uppercase">Name</TableHead>
          <TableHead className="text-xs font-medium tracking-wide text-text-secondary uppercase">Category</TableHead>
          <TableHead className="text-xs font-medium tracking-wide text-text-secondary uppercase">Cost</TableHead>
          <TableHead className="text-xs font-medium tracking-wide text-text-secondary uppercase">Cycle</TableHead>
          <TableHead className="text-xs font-medium tracking-wide text-text-secondary uppercase">
            Next Renewal
          </TableHead>
          <TableHead className="text-xs font-medium tracking-wide text-text-secondary uppercase">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((subscription) => (
          <TableRow
            key={subscription.id}
            onClick={() => router.push(`/subscriptions/${subscription.id}`)}
            className="cursor-pointer hover:bg-surface-secondary"
          >
            <TableCell className="text-sm font-medium text-text-primary">{subscription.name}</TableCell>
            <TableCell>
              <CategoryBadge category={subscription.category} />
            </TableCell>
            <TableCell className="text-sm text-text-primary">
              {formatCurrency(subscription.cost, subscription.currency)}
            </TableCell>
            <TableCell className="text-sm text-text-primary">{formatBillingCycle(subscription)}</TableCell>
            <TableCell className="text-sm text-text-primary">{formatDate(subscription.nextRenewalDate)}</TableCell>
            <TableCell>
              <StatusBadge status={subscription.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
