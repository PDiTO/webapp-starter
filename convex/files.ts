// convex/files.ts - Generates upload URLs and persists uploaded avatars in Convex storage.
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const saveAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile?.avatarStorageId) {
      await ctx.storage.delete(existingProfile.avatarStorageId);
    }

    const avatarUrl = await ctx.storage.getUrl(args.storageId);

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        avatarStorageId: args.storageId,
      });
    } else {
      await ctx.db.insert("profiles", {
        avatarStorageId: args.storageId,
        userId,
      });
    }

    await ctx.db.patch(userId, {
      image: avatarUrl ?? undefined,
    });

    return {
      avatarUrl,
    };
  },
});
