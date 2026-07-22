import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SpendLimitSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="text-base font-semibold">Monthly Spend Limit</CardTitle>
        <Badge variant="outline" className="border-transparent bg-info-light text-info-foreground">
          Coming in v2
        </Badge>
      </CardHeader>
      <CardContent>
        <Input type="number" placeholder="No limit set" disabled readOnly className="max-w-xs" />
      </CardContent>
    </Card>
  );
}
