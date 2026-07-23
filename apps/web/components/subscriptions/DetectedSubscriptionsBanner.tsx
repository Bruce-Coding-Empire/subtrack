import Link from "next/link";
import { MailSearch } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  count: number;
};

export function DetectedSubscriptionsBanner({ count }: Props) {
  if (count === 0) return null;

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MailSearch className="size-5 text-accent" />
          <p className="text-sm font-medium text-text-primary">
            {count} subscription{count === 1 ? "" : "s"} detected from your inbox — waiting for review
          </p>
        </div>
        <Link
          href="/subscriptions/detected"
          className={cn(buttonVariants(), "bg-accent text-accent-foreground hover:bg-accent-dark")}
        >
          Review
        </Link>
      </CardContent>
    </Card>
  );
}
