import { RenewalUrgencyPill } from "@/components/subscriptions/RenewalUrgencyPill";
import { formatCurrency } from "@/lib/format";
import type { UpcomingRenewal } from "@/types";

type Props = {
  renewals: UpcomingRenewal[];
};

export function UpcomingRenewalsList({ renewals }: Props) {
  if (renewals.length === 0) {
    return <p className="py-8 text-center text-sm text-text-muted">No renewals due in the next 7 days.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {renewals.map((renewal) => (
        <li key={renewal.id} className="flex items-center justify-between gap-3 py-3">
          <span className="text-sm font-medium text-text-primary">{renewal.name}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">{formatCurrency(renewal.amount, renewal.currency)}</span>
            <RenewalUrgencyPill nextRenewalDate={renewal.nextRenewalDate} />
          </div>
        </li>
      ))}
    </ul>
  );
}
