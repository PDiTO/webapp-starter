// convex/auth.ts - Configures native Convex Auth with the password provider.
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const email = String(params.email ?? "").trim().toLowerCase();
        const name = String(params.name ?? "").trim();

        return {
          email,
          ...(name ? { name } : {}),
        };
      },
    }),
  ],
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const [user, profile] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
    ]);

    return user === null
      ? null
      : {
          ...user,
          bio: profile?.bio ?? "",
        };
  },
});

export const updateProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const name = args.name.trim();
    const bio = args.bio?.trim();

    if (!name) {
      throw new Error("Name is required");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    await ctx.db.patch(userId, {
      name,
    });

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        bio: bio || undefined,
      });
    } else if (bio) {
      await ctx.db.insert("profiles", {
        bio,
        userId,
      });
    }
  },
});
