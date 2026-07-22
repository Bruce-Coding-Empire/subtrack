import type { Metadata } from "next";

import { SettingsPageClient } from "@/components/settings/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings - SubTrack",
  description: "Manage your profile, currency, and preferences.",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
