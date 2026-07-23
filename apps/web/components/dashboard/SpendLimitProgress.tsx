import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  spendLimit: number | null;
  currentMonthSpend: number;
  percentageUsed: number | null;
  isOverLimit: boolean;
  baseCurrency: string;
};

export function SpendLimitProgress({ spendLimit, currentMonthSpend, percentageUsed, isOverLimit, baseCurrency }: Props) {
  if (spendLimit === null || percentageUsed === null) {
    return (
      <Card>
        <CardContent className="flex flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">Set a monthly limit to track your spending against it.</p>
          <Link href="/settings" className={cn(buttonVariants(), "bg-accent text-accent-foreground hover:bg-accent-dark")}>
            Set a monthly limit
          </Link>
        </CardContent>
      </Card>
    );
  }

  const indicatorColor = isOverLimit ? "bg-error" : percentageUsed >= 90 ? "bg-warning" : "bg-accent";
  const valueColor = isOverLimit ? "text-error" : percentageUsed >= 90 ? "text-warning" : "text-text-primary";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-row items-baseline justify-between">
          <span className="text-sm font-medium text-text-primary">Monthly Spend Limit</span>
          <span className={cn("text-sm font-medium", valueColor)}>
            {formatCurrency(currentMonthSpend, baseCurrency)} / {formatCurrency(spendLimit, baseCurrency)}
          </span>
        </div>
        <Progress value={Math.min(percentageUsed, 100)}>
          <ProgressTrack className="bg-surface-secondary">
            <ProgressIndicator className={indicatorColor} />
          </ProgressTrack>
        </Progress>
        <span className="text-xs text-text-muted">
          {percentageUsed.toFixed(1)}% used{isOverLimit ? " — over limit" : ""}
        </span>
      </CardContent>
    </Card>
  );
}
