import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubscriptionDetailClient } from "@/components/subscriptions/SubscriptionDetailClient";
import { getMockSubscriptionById } from "@/lib/mock-data";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const subscription = getMockSubscriptionById(id);

  if (!subscription) {
    return { title: "Subscription Not Found - SubTrack" };
  }

  return { title: `${subscription.name} - SubTrack` };
}

export default async function SubscriptionDetailPage({ params }: Props) {
  const { id } = await params;
  const subscription = getMockSubscriptionById(id);

  if (!subscription) {
    notFound();
  }

  return <SubscriptionDetailClient subscription={subscription} />;
}
