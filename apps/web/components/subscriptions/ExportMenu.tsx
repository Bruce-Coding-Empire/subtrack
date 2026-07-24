"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadExport, type ExportFormat, type ExportResource } from "@/lib/export";
import { cn } from "@/lib/utils";

const EXPORT_GROUPS: { label: string; resource: ExportResource }[] = [
  { label: "Subscriptions", resource: "subscriptions" },
  { label: "Payment History", resource: "payment-history" },
];

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: "csv", label: "CSV" },
  { format: "pdf", label: "PDF" },
];

export function ExportMenu() {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(resource: ExportResource, format: ExportFormat) {
    const key = `${resource}-${format}`;
    setPendingKey(key);
    setError(null);
    const result = await downloadExport(resource, format);
    if (!result.success) {
      setError(result.error);
    }
    setPendingKey(null);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={pendingKey !== null}
          className={cn(buttonVariants(), "border-accent bg-surface text-accent hover:bg-accent-light")}
        >
          <Download className="size-4" />
          Export
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {EXPORT_GROUPS.map((group, index) => (
            <DropdownMenuGroup key={group.resource}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              {FORMATS.map(({ format, label }) => {
                const key = `${group.resource}-${format}`;
                return (
                  <DropdownMenuItem
                    key={key}
                    disabled={pendingKey !== null}
                    onClick={() => handleExport(group.resource, format)}
                  >
                    {pendingKey === key ? "Exporting…" : `Export as ${label}`}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
