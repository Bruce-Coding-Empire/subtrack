import type { Metadata } from "next";

import { DetectedSubscriptionsPageClient } from "@/components/subscriptions/DetectedSubscriptionsPageClient";

export const metadata: Metadata = {
  title: "Detected Subscriptions - SubTrack",
  description: "Review subscriptions detected from your connected inbox.",
};

export default function DetectedSubscriptionsPage() {
  return <DetectedSubscriptionsPageClient />;
}
