"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { getCurrentUserProfile, PROFILE_UPDATED_EVENT } from "@/lib/users";
import type { UserProfile } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getCurrentUserProfile();
      if (!cancelled && result.success && result.data) {
        setUser(result.data);
      }
    }

    load();
    window.addEventListener(PROFILE_UPDATED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_UPDATED_EVENT, load);
    };
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="h-16 w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/subtrack.png" alt="SubTrack" width={28} height={28} />
            <span className="text-base font-bold text-text-primary">SubTrack</span>
          </Link>
          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-accent" : "text-text-secondary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-primary">{user.name}</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-accent-light text-sm font-medium text-accent">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
