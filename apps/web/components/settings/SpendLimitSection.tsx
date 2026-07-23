"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/types";

type Props = {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
};

function toInputValue(limit: number | null): string {
  return limit === null ? "" : String(limit);
}

export function SpendLimitSection({ profile, onSaved }: Props) {
  const [value, setValue] = useState(toInputValue(profile.monthlySpendLimit));

  const isNegative = value.trim() !== "" && Number(value) < 0;
  const isDirty = value !== toInputValue(profile.monthlySpendLimit);

  function handleSave() {
    const monthlySpendLimit = value.trim() === "" ? null : Number(value);
    onSaved({ ...profile, monthlySpendLimit });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Monthly Spend Limit</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex max-w-xs flex-col gap-1">
          <Label htmlFor="spend-limit">Limit ({profile.baseCurrency})</Label>
          <Input
            id="spend-limit"
            type="number"
            min="0"
            step="0.01"
            placeholder="No limit set"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid={isNegative}
          />
          {isNegative && <p className="text-xs text-error">Limit must not be negative</p>}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isNegative}
            className="bg-accent text-accent-foreground hover:bg-accent-dark"
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
