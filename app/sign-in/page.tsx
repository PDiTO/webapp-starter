"use client";

// app/sign-in/page.tsx - Auth page for signing in or creating an account.
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthForm } from "@/components/auth/auth-form";

export default function SignInPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/tasks");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(17,24,39,0.08),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 py-10">
        <AuthForm />
      </div>
    </div>
  );
}
