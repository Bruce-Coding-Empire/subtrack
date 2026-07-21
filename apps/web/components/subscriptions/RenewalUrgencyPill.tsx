import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { getRenewalUrgency } from "@/lib/renewal-urgency";

type Props = {
  nextRenewalDate: string;
  className?: string;
};

const URGENCY_CLASSES = {
  error: "bg-error-light text-error-foreground",
  warning: "bg-warning-light text-warning-foreground",
  info: "bg-info-light text-info-foreground",
} as const;

export function RenewalUrgencyPill({ nextRenewalDate, className }: Props) {
  const urgency = getRenewalUrgency(nextRenewalDate);

  if (!urgency) {
    return <span className={cn("text-sm text-text-primary", className)}>{formatDate(nextRenewalDate)}</span>;
  }

  return (
    <Badge variant="outline" className={cn("border-transparent", URGENCY_CLASSES[urgency], className)}>
      {formatDate(nextRenewalDate)}
    </Badge>
  );
}
