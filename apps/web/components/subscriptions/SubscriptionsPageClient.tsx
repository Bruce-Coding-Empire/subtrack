"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AddSubscriptionDialog } from "@/components/subscriptions/AddSubscriptionDialog";
import { DetectedSubscriptionsBanner } from "@/components/subscriptions/DetectedSubscriptionsBanner";
import { SubscriptionFilters } from "@/components/subscriptions/SubscriptionFilters";
import { SubscriptionsPagination } from "@/components/subscriptions/SubscriptionsPagination";
import { SubscriptionsTable } from "@/components/subscriptions/SubscriptionsTable";
import { listSubscriptions } from "@/lib/subscriptions";
import { mockDetectedSubscriptions } from "@/lib/mock-detected-subscriptions";
import type { Subscription, SubscriptionStatus } from "@/types";

const PENDING_DETECTED_COUNT = mockDetectedSubscriptions.filter(
  (detected) => detected.status === "pending",
).length;

type StatusFilter = SubscriptionStatus | "all";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function SubscriptionsPageClient() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      const result = await listSubscriptions({
        status: status === "all" ? undefined : status,
        search: debouncedSearch || undefined,
        page,
        limit: DEFAULT_PAGE_SIZE,
      });
      if (cancelled) return;

      if (result.success && result.data) {
        setSubscriptions(result.data.items);
        setTotal(result.data.total);
      } else {
        setError(result.error ?? "Failed to load subscriptions — please try again");
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [status, debouncedSearch, page, refreshToken]);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: StatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function handleCreated() {
    setPage(1);
    setRefreshToken((token) => token + 1);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-text-primary">Subscriptions</h1>
        <AddSubscriptionDialog onCreated={handleCreated} />
      </div>

      <DetectedSubscriptionsBanner count={PENDING_DETECTED_COUNT} />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <SubscriptionFilters
            search={search}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
          />
          {error ? (
            <p className="py-16 text-center text-sm text-error">{error}</p>
          ) : isLoading ? (
            <p className="py-16 text-center text-sm text-text-muted">Loading subscriptions…</p>
          ) : (
            <SubscriptionsTable subscriptions={subscriptions} />
          )}
        </CardContent>
        {!error && !isLoading && totalPages > 1 && (
          <CardFooter className="border-t border-border">
            <SubscriptionsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
