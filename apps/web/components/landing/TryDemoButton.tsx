"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

// Logs into the seeded demo account through the normal /auth/login path — the
// normal auth flow exercising the demo is itself part of the demo. The
// credentials are deliberately public (see code-standards.md); the account's
// data is wiped and reseeded nightly.
export function TryDemoButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!DEMO_EMAIL || !DEMO_PASSWORD) return null;

  async function handleClick() {
    if (!DEMO_EMAIL || !DEMO_PASSWORD) return;
    setError(null);
    setIsLoading(true);

    const result = await login(DEMO_EMAIL, DEMO_PASSWORD);
    if (!result.success) {
      setIsLoading(false);
      setError(result.error ?? "The demo is unavailable right now — please try again");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="lg"
        disabled={isLoading}
        onClick={handleClick}
        className="border-accent bg-surface text-accent hover:bg-accent-light"
      >
        {isLoading ? "Loading demo…" : "Try the demo"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
