import { CalendarClock, ListChecks, PieChart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ListChecks,
    title: "Track everything",
    description:
      "Log every subscription once — streaming, software, gym, hosting. Any currency, any billing cycle: weekly, monthly, yearly, or custom.",
  },
  {
    icon: CalendarClock,
    title: "Never miss a renewal",
    description:
      "SubTrack calculates when each subscription renews and keeps a running history of every payment, automatically.",
  },
  {
    icon: PieChart,
    title: "See where your money goes",
    description:
      "One dashboard: total spend in your currency, category breakdown, and how your spend is trending over time.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent-light text-accent">
                <Icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
