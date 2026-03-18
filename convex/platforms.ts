import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("platforms")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const connect = mutation({
  args: {
    platform: v.string(),
    displayName: v.string(),
    handle: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already connected
    const existing = await ctx.db
      .query("platforms")
      .withIndex("by_user_platform", (q) =>
        q.eq("userId", userId).eq("platform", args.platform)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        handle: args.handle,
        isConnected: true,
        connectedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("platforms", {
      userId,
      platform: args.platform,
      displayName: args.displayName,
      handle: args.handle,
      isConnected: true,
      connectedAt: Date.now(),
    });
  },
});

export const disconnect = mutation({
  args: { platformId: v.id("platforms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const platform = await ctx.db.get(args.platformId);
    if (!platform || platform.userId !== userId) {
      throw new Error("Platform not found");
    }

    await ctx.db.patch(args.platformId, { isConnected: false });
  },
});

export const remove = mutation({
  args: { platformId: v.id("platforms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const platform = await ctx.db.get(args.platformId);
    if (!platform || platform.userId !== userId) {
      throw new Error("Platform not found");
    }

    await ctx.db.delete(args.platformId);
  },
});
