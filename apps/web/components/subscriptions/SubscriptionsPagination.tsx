"use client";

import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function SubscriptionsPagination({ page, totalPages, onPageChange }: Props) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <Pagination className="w-full justify-between">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={isFirstPage}
            className={cn(isFirstPage && "pointer-events-none opacity-50")}
            onClick={(event) => {
              event.preventDefault();
              if (!isFirstPage) onPageChange(page - 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>

      <p className="text-xs text-text-muted">
        Page {page} of {totalPages}
      </p>

      <PaginationContent>
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={isLastPage}
            className={cn(isLastPage && "pointer-events-none opacity-50")}
            onClick={(event) => {
              event.preventDefault();
              if (!isLastPage) onPageChange(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
