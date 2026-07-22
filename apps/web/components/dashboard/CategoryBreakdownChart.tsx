"use client";

import { Pie, PieChart, ResponsiveContainer } from "recharts";

import { CATEGORY_CHART_COLORS, CATEGORY_OPTIONS } from "@/lib/subscription-options";
import type { CategoryBreakdownEntry } from "@/types";

type Props = {
  data: CategoryBreakdownEntry[];
};

function categoryLabel(category: CategoryBreakdownEntry["category"]): string {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;
}

export function CategoryBreakdownChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-text-muted">No category spend yet.</p>;
  }

  const chartData = data.map((entry) => ({
    ...entry,
    fill: CATEGORY_CHART_COLORS[entry.category],
  }));

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={80} paddingAngle={2} isAnimationActive={false} />
        </PieChart>
      </ResponsiveContainer>

      <ul className="flex flex-col gap-2">
        {data.map((entry) => (
          <li key={entry.category} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_CHART_COLORS[entry.category] }} />
            <span className="text-text-primary">{categoryLabel(entry.category)}</span>
            <span className="ml-auto text-text-muted">{entry.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
