"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { disconnectGmail, getGmailConnectUrl, getGmailStatus } from "@/lib/integrations";

export function GmailConnectionSection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getGmailStatus();
      if (cancelled) return;
      if (result.success && result.data) {
        setIsConnected(result.data.connected);
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleConnect() {
    setIsSubmitting(true);
    setError(null);
    const result = await getGmailConnectUrl();

    if (!result.success || !result.data) {
      setError(result.error ?? "Failed to start Gmail connection — please try again");
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.data.url;
  }

  async function handleDisconnect() {
    setIsSubmitting(true);
    setError(null);
    const result = await disconnectGmail();
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to disconnect Gmail — please try again");
      return;
    }

    setIsConnected(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Gmail Connection</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-text-muted" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">
                {isLoading ? "Checking connection…" : isConnected ? "Connected" : "Not connected"}
              </span>
              <span className="text-xs text-text-muted">
                {isConnected
                  ? "Scanning your inbox for subscription receipts"
                  : "Connect Gmail to automatically detect subscriptions from receipt emails"}
              </span>
            </div>
          </div>

          {isConnected ? (
            <Button
              type="button"
              onClick={handleDisconnect}
              disabled={isLoading || isSubmitting}
              className="border-error bg-surface text-error hover:bg-error-light"
            >
              {isSubmitting ? "Disconnecting…" : "Disconnect"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConnect}
              disabled={isLoading || isSubmitting}
              className="bg-accent text-accent-foreground hover:bg-accent-dark"
            >
              {isSubmitting ? "Connecting…" : "Connect Gmail"}
            </Button>
          )}
        </div>

        {error && (
          <p role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
