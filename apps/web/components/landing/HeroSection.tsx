import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { TryDemoButton } from "@/components/landing/TryDemoButton";

export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-20 text-center sm:py-28">
      <div className="flex flex-col items-center gap-6">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Your subscriptions are quietly draining you.
        </h1>
        <p className="max-w-2xl text-lg text-text-secondary">
          Track every subscription, every currency, every renewal — in one place. See exactly what
          you&apos;re paying for, before it adds up.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/register"
          className={cn(buttonVariants({ size: "lg" }), "bg-accent text-accent-foreground hover:bg-accent-dark")}
        >
          Get Started
        </Link>
        <TryDemoButton />
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Log in
        </Link>
      </div>

      <DashboardPreview />
    </section>
  );
}
