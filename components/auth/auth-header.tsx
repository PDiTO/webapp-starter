"use client";

// components/auth/auth-header.tsx - Shows the simplified top navigation for public and signed-in views.
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { AccountMenu } from "@/components/auth/account-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

export function AuthHeader() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.auth.currentUser, isAuthenticated ? {} : "skip");

  return (
    <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
      <Link className="text-sm font-semibold tracking-[0.22em] uppercase" href={isAuthenticated ? "/tasks" : "/"}>
        Convex Tasks
      </Link>
      {isLoading ? null : (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <AccountMenu
              email={currentUser?.email}
              image={currentUser?.image}
              name={currentUser?.name}
            />
          ) : pathname === "/sign-in" ? null : (
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
