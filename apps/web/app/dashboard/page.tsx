import type { Metadata } from "next";

import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient";

export const metadata: Metadata = {
  title: "Dashboard - SubTrack",
  description: "Your subscription spend at a glance.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
