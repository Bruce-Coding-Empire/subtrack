import { Card, CardContent } from "@/components/ui/card";

type Props = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <span className="text-[30px] leading-9 font-semibold text-text-primary">{value}</span>
        <span className="text-xs text-text-muted">{label}</span>
      </CardContent>
    </Card>
  );
}
