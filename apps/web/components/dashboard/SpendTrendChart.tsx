"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { formatMonthLabel } from "@/lib/format";
import type { SpendTrendPoint } from "@/types";

type Props = {
  points: SpendTrendPoint[];
};

function formatCompactAmount(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export function SpendTrendChart({ points }: Props) {
  const hasData = points.length > 0 && points.some((point) => point.amount > 0);

  if (!hasData) {
    return <p className="py-16 text-center text-sm text-text-muted">No spend history yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCompactAmount}
          tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="var(--color-accent)"
          strokeWidth={3}
          fill="url(#spendTrendFill)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
