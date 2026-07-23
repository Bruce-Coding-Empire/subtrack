import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BILLING_CYCLE_LABELS } from "@/lib/subscription-options";
import { formatCurrency, formatDate } from "@/lib/format";
import type { DetectedSubscription } from "@/types";

type Props = {
  detected: DetectedSubscription;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
};

export function DetectedSubscriptionRow({ detected, onApprove, onDismiss }: Props) {
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{detected.vendorName ?? "Unknown vendor"}</span>
          {detected.billingCycle ? (
            <Badge variant="outline" className="border-transparent bg-surface-secondary text-text-secondary">
              {BILLING_CYCLE_LABELS[detected.billingCycle]}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-transparent bg-warning-light text-warning-foreground">
              Cycle unknown
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-text-muted">{detected.rawSubject}</p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-text-primary">
            {detected.amount !== null && detected.currency
              ? formatCurrency(detected.amount, detected.currency)
              : "Amount not detected"}
          </span>
          {detected.receivedAt && (
            <span className="text-xs text-text-muted">{formatDate(detected.receivedAt.slice(0, 10))}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => onDismiss(detected.id)}
            className="border-accent bg-surface text-accent hover:bg-accent-light"
          >
            Dismiss
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onApprove(detected.id)}
            className="bg-accent text-accent-foreground hover:bg-accent-dark"
          >
            Approve
          </Button>
        </div>
      </div>
    </li>
  );
}
