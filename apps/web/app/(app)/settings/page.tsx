import type { Metadata } from "next";

import { SettingsPageClient } from "@/components/settings/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings - SubTrack",
  description: "Manage your profile, currency, and preferences.",
};

type Props = {
  searchParams: Promise<{ gmail?: string }>;
};

export default async function SettingsPage({ searchParams }: Props) {
  const { gmail } = await searchParams;
  const gmailStatus = gmail === "connected" || gmail === "error" ? gmail : null;

  return <SettingsPageClient gmailStatus={gmailStatus} />;
}
