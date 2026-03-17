// convex/schema.ts - Defines the Convex data model for auth and task storage.
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    avatarStorageId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
  tasks: defineTable({
    completed: v.boolean(),
    name: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
});
