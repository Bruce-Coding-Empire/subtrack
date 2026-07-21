"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AddSubscriptionDialog } from "@/components/subscriptions/AddSubscriptionDialog";
import { SubscriptionFilters } from "@/components/subscriptions/SubscriptionFilters";
import { SubscriptionsPagination } from "@/components/subscriptions/SubscriptionsPagination";
import { SubscriptionsTable } from "@/components/subscriptions/SubscriptionsTable";
import type { Subscription, SubscriptionStatus } from "@/types";

type StatusFilter = SubscriptionStatus | "all";

const DEFAULT_PAGE_SIZE = 10;

type Props = {
  initialSubscriptions: Subscription[];
};

export function SubscriptionsPageClient({ initialSubscriptions }: Props) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subscriptions.filter((subscription) => {
      const matchesStatus = status === "all" || subscription.status === status;
      const matchesSearch = query.length === 0 || subscription.name.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / DEFAULT_PAGE_SIZE));

  const paginatedSubscriptions = useMemo(() => {
    const start = (page - 1) * DEFAULT_PAGE_SIZE;
    return filteredSubscriptions.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [filteredSubscriptions, page]);

  function handleCreate(subscription: Subscription) {
    setSubscriptions((current) => [subscription, ...current]);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: StatusFilter) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-text-primary">Subscriptions</h1>
        <AddSubscriptionDialog onCreate={handleCreate} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <SubscriptionFilters
            search={search}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
          />
          <SubscriptionsTable subscriptions={paginatedSubscriptions} />
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="border-t border-border">
            <SubscriptionsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
