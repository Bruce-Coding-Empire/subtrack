import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const NOTIFICATION_TOGGLES = [
  { id: "renewal-reminders", label: "Renewal Reminders" },
  { id: "spend-limit-alerts", label: "Spend Limit Alerts" },
];

export function NotificationsSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="text-base font-semibold">Notifications</CardTitle>
        <Badge variant="outline" className="border-transparent bg-info-light text-info-foreground">
          Coming in v2
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {NOTIFICATION_TOGGLES.map((toggle) => (
          <div key={toggle.id} className="flex items-center justify-between">
            <label htmlFor={toggle.id} className="text-sm font-medium text-text-primary">
              {toggle.label}
            </label>
            <Switch id={toggle.id} checked={false} disabled />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
