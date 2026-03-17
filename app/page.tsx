"use client";

// app/page.tsx - Public landing page for the Convex task starter.
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/tasks");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.10),transparent_38%),linear-gradient(180deg,var(--background)_0%,color-mix(in_oklab,var(--background)_88%,var(--muted))_100%)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center px-4 py-10">
        <section className="flex max-w-2xl flex-col items-center justify-center gap-5 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Convex-first starter
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Tasks, auth, and live data with Convex only.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            A minimal task app with native Convex Auth and live queries. Sign
            in to see your task list update in real time.
          </p>
        </section>
      </div>
    </div>
  );
}
