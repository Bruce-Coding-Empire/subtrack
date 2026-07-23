import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  return (
    <header className="w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/subtrack.png" alt="SubTrack" width={28} height={28} />
          <span className="text-base font-bold text-text-primary">SubTrack</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary">
            Log in
          </Link>
          <Link href="/register" className={cn(buttonVariants(), "bg-accent text-accent-foreground hover:bg-accent-dark")}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
