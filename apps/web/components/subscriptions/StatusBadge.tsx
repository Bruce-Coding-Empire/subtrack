import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/types";

type Props = {
  status: SubscriptionStatus;
  className?: string;
};

const STATUS_CLASSES: Record<SubscriptionStatus, string> = {
  active: "bg-success-light text-success-foreground",
  cancelled: "bg-surface-secondary text-text-secondary",
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  cancelled: "Cancelled",
};

export function StatusBadge({ status, className }: Props) {
  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_CLASSES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
