import Link from "next/link";
import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <Inbox className="size-8 text-text-muted" />
        <p className="text-sm text-text-muted">You have no subscriptions yet — add one to see your dashboard.</p>
        <Link href="/subscriptions" className={cn(buttonVariants(), "bg-accent text-accent-foreground hover:bg-accent-dark")}>
          Add your first subscription
        </Link>
      </CardContent>
    </Card>
  );
}
