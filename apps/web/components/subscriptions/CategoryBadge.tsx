import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_BADGE_CLASSES, CATEGORY_OPTIONS } from "@/lib/subscription-options";
import type { SubscriptionCategory } from "@/types";

type Props = {
  category: SubscriptionCategory;
  className?: string;
};

export function CategoryBadge({ category, className }: Props) {
  const label = CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;

  return (
    <Badge variant="outline" className={cn("border-transparent", CATEGORY_BADGE_CLASSES[category], className)}>
      {label}
    </Badge>
  );
}
