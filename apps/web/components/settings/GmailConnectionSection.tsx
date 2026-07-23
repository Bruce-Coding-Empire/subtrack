"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_CONNECTED_EMAIL = "test@subtrack.dev";

export function GmailConnectionSection() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Gmail Connection</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mail className="size-5 text-text-muted" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              {isConnected ? "Connected" : "Not connected"}
            </span>
            <span className="text-xs text-text-muted">
              {isConnected
                ? `Scanning ${MOCK_CONNECTED_EMAIL} for subscription receipts`
                : "Connect Gmail to automatically detect subscriptions from receipt emails"}
            </span>
          </div>
        </div>

        {isConnected ? (
          <Button
            type="button"
            onClick={() => setIsConnected(false)}
            className="border-error bg-surface text-error hover:bg-error-light"
          >
            Disconnect
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setIsConnected(true)}
            className="bg-accent text-accent-foreground hover:bg-accent-dark"
          >
            Connect Gmail
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
