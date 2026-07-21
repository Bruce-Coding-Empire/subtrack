import type { Metadata } from "next";

import { SubscriptionsPageClient } from "@/components/subscriptions/SubscriptionsPageClient";
import { MOCK_SUBSCRIPTIONS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Subscriptions - SubTrack",
  description: "View, search, and manage your recurring subscriptions.",
};

export default function SubscriptionsPage() {
  return <SubscriptionsPageClient initialSubscriptions={MOCK_SUBSCRIPTIONS} />;
}
