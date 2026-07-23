import type { Metadata } from "next";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemStrip } from "@/components/landing/ProblemStrip";
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";
import { ClosingCtaBand } from "@/components/landing/ClosingCtaBand";

export const metadata: Metadata = {
  title: "SubTrack — Track every subscription, every currency, every renewal",
  description:
    "Track every subscription, every currency, every renewal — in one place. See exactly what you're paying for, before it adds up.",
  openGraph: {
    title: "SubTrack",
    description: "Track every subscription, every currency, every renewal — in one place.",
    type: "website",
    images: ["/subtrack.png"],
  },
  twitter: {
    card: "summary",
    title: "SubTrack",
    description: "Track every subscription, every currency, every renewal — in one place.",
    images: ["/subtrack.png"],
  },
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <ProblemStrip />
        <FeatureHighlights />
        <ClosingCtaBand />
      </main>
    </div>
  );
}
