import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClosingCtaBand() {
  return (
    <section className="w-full bg-accent">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to see where your money&apos;s going?
        </h2>
        <Link href="/register" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
          Get Started — it&apos;s free
        </Link>
      </div>
    </section>
  );
}
