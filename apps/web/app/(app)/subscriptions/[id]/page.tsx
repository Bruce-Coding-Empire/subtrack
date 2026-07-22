import type { Metadata } from "next";

import { SubscriptionDetailClient } from "@/components/subscriptions/SubscriptionDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Subscription - SubTrack",
};

export default async function SubscriptionDetailPage({ params }: Props) {
  const { id } = await params;
  return <SubscriptionDetailClient id={id} />;
}
