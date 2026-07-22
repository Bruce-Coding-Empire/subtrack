"use client";

import { useEffect, useState } from "react";

import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { SpendLimitSection } from "@/components/settings/SpendLimitSection";
import { getCurrentUserProfile } from "@/lib/users";
import type { UserProfile } from "@/types";

export function SettingsPageClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      const result = await getCurrentUserProfile();
      if (cancelled) return;

      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.error ?? "Failed to load profile — please try again");
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
      <h1 className="text-base font-semibold text-text-primary">Settings</h1>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-text-muted">Loading settings…</p>
      ) : error || !profile ? (
        <p className="py-16 text-center text-sm text-error">{error ?? "Failed to load profile"}</p>
      ) : (
        <div className="flex max-w-2xl flex-col gap-6">
          <ProfileSection profile={profile} onSaved={setProfile} />
          <SpendLimitSection />
          <NotificationsSection />
        </div>
      )}
    </div>
  );
}
