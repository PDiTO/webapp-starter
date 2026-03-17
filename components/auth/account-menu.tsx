"use client";

// components/auth/account-menu.tsx - Shows the signed-in user menu with profile and sign-out actions.
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/auth/user-avatar";

type AccountMenuProps = {
  email?: string | null;
  image?: string | null;
  name?: string | null;
};

export function AccountMenu({
  email,
  image,
  name,
}: Readonly<AccountMenuProps>) {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen]);

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <UserAvatar image={image} name={name || email} />
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-12 z-20 w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg">
          <div className="border-b px-3 py-2">
            <p className="font-medium">{name || "Your account"}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="pt-2">
            <Button asChild className="w-full justify-start" variant="ghost">
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                <User />
                Profile
              </Link>
            </Button>
            <Button
              className="w-full justify-start"
              onClick={handleSignOut}
              variant="ghost"
            >
              <LogOut />
              Sign Out
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
