// convex/tasks.ts - Task queries and mutations scoped to the authenticated user.
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

type TaskCtx = MutationCtx | QueryCtx;

async function getCurrentUserId(ctx: TaskCtx) {
  const userId = await getAuthUserId(ctx);

  if (userId === null) {
    throw new Error("Unauthorized");
  }

  return userId;
}

async function getTaskOrThrow(ctx: MutationCtx, taskId: Id<"tasks">) {
  const [task, userId] = await Promise.all([
    ctx.db.get(taskId),
    getCurrentUserId(ctx),
  ]);

  if (!task || task.userId !== userId) {
    throw new Error("Task not found");
  }

  return task;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);

    return ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    return ctx.db.insert("tasks", {
      completed: false,
      name: args.name.trim(),
      userId,
    });
  },
});

export const update = mutation({
  args: {
    completed: v.boolean(),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await getTaskOrThrow(ctx, args.taskId);

    await ctx.db.patch(args.taskId, { completed: args.completed });
  },
});

export const remove = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await getTaskOrThrow(ctx, args.taskId);

    await ctx.db.delete(args.taskId);
  },
});
