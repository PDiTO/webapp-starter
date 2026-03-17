"use client";

// components/auth/user-avatar.tsx - Renders the signed-in user's avatar or initials fallback.
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  image?: string | null;
  name?: string | null;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "h-9 w-9 text-sm",
  md: "h-24 w-24 text-2xl",
};

function getInitials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (parts.length === 0) {
    return "?";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({
  image,
  name,
  size = "sm",
}: Readonly<UserAvatarProps>) {
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted font-medium leading-none text-muted-foreground",
        sizeClasses[size]
      )}
    >
      {image ? (
        <span
          aria-hidden="true"
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : (
        initials
      )}
    </span>
  );
}
