"use client";

// app/profile/page.tsx - Lets the signed-in user update their name and avatar stored in Convex.
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";
import { ErrorToast } from "@/components/ui/error-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(api.auth.currentUser, isAuthenticated ? {} : "skip");
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveAvatar = useMutation(api.files.saveAvatar);
  const updateProfile = useMutation(api.auth.updateProfile);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser) {
      setBio(currentUser.bio ?? "");
      setName(currentUser.name ?? "");
    }
  }, [currentUser]);

  async function handleAvatarChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setSaved(false);
    setIsUploadingAvatar(true);

    try {
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        body: file,
        headers: {
          "Content-Type": file.type,
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar.");
      }

      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };

      await saveAvatar({ storageId });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar.");
    } finally {
      e.target.value = "";
      setIsUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    setSaved(false);

    try {
      await updateProfile({ bio, name });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {error ? <ErrorToast message={error} onClose={() => setError(null)} /> : null}
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-14">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Account
          </p>
        </div>

        <div className="mb-10 flex flex-col items-center">
          <button
            className="group relative block h-24 w-24 cursor-pointer overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
            disabled={isUploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <UserAvatar
              image={currentUser?.image}
              name={name || currentUser?.email}
              size="md"
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/45 opacity-0 transition-opacity group-hover:opacity-100">
              {isUploadingAvatar ? (
                <Loader2 className="h-5 w-5 animate-spin text-background" />
              ) : (
                <Camera className="h-5 w-5 text-background" />
              )}
            </span>
          </button>
          <input
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            ref={fileInputRef}
            type="file"
          />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input disabled id="email" type="email" value={currentUser?.email ?? ""} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              value={name}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="bio">
              Bio
            </label>
            <Textarea
              id="bio"
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a little about yourself"
              rows={4}
              value={bio}
            />
          </div>

          <div className="space-y-3 pt-2">
            <Button className="w-full" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {saved ? (
              <p className="text-center text-sm text-muted-foreground">
                Profile saved.
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
