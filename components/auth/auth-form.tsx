"use client";

// components/auth/auth-form.tsx - Handles password sign-in and account creation with native Convex Auth.
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorToast } from "@/components/ui/error-toast";
import { Input } from "@/components/ui/input";

type Mode = "sign-in" | "sign-up";

const COPY: Record<Mode, { action: string; switchLabel: string; title: string }> =
  {
    "sign-in": {
      action: "Sign In",
      switchLabel: "Need an account? Create one",
      title: "Sign in",
    },
    "sign-up": {
      action: "Create Account",
      switchLabel: "Already have an account? Sign in",
      title: "Create account",
    },
  };

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/tasks");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn("password", {
        email,
        flow: mode === "sign-up" ? "signUp" : "signIn",
        ...(mode === "sign-up" ? { name } : {}),
        password,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const copy = COPY[mode];

  return (
    <>
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      <Card className="w-full max-w-md border-border/70 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>
            Use your email and password to access your live task list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            {mode === "sign-up" && (
              <Input
                autoComplete="name"
                minLength={1}
                name="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                value={name}
              />
            )}
            <Input
              autoComplete="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
            <Input
              autoComplete={
                mode === "sign-up" ? "new-password" : "current-password"
              }
              minLength={8}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {copy.action}
            </Button>
          </form>
          <Button
            className="w-full"
            onClick={() =>
              setMode((current) =>
                current === "sign-in" ? "sign-up" : "sign-in"
              )
            }
            type="button"
            variant="ghost"
          >
            {copy.switchLabel}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
