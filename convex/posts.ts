import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const post = await ctx.db.get(args.id);
    if (!post || post.userId !== userId) return null;
    return post;
  },
});

export const getResults = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("postResults")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    platforms: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const status = args.scheduledFor ? "scheduled" : "publishing";

    const postId = await ctx.db.insert("posts", {
      userId,
      content: args.content,
      status,
      scheduledFor: args.scheduledFor,
      createdAt: Date.now(),
    });

    // Create pending results for each platform
    for (const platform of args.platforms) {
      await ctx.db.insert("postResults", {
        postId,
        userId,
        platform,
        status: "pending",
      });
    }

    return postId;
  },
});

export const simulatePublish = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== userId) {
      throw new Error("Post not found");
    }

    const results = await ctx.db
      .query("postResults")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    // Simulate publishing to each platform
    for (const result of results) {
      const success = Math.random() > 0.1; // 90% success rate
      await ctx.db.patch(result._id, {
        status: success ? "success" : "failed",
        platformPostId: success ? `${result.platform}_${Date.now()}` : undefined,
        platformUrl: success ? `https://${result.platform}.com/post/${Date.now()}` : undefined,
        errorMessage: success ? undefined : "Simulated error - API connection failed",
        publishedAt: success ? Date.now() : undefined,
      });
    }

    await ctx.db.patch(args.postId, {
      status: "published",
      publishedAt: Date.now(),
    });
  },
});

export const deleteDraft = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.id);
    if (!post || post.userId !== userId) {
      throw new Error("Post not found");
    }

    // Delete associated results
    const results = await ctx.db
      .query("postResults")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();

    for (const result of results) {
      await ctx.db.delete(result._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const platforms = await ctx.db
      .query("platforms")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const results = await ctx.db
      .query("postResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === "published").length,
      scheduledPosts: posts.filter(p => p.status === "scheduled").length,
      connectedPlatforms: platforms.filter(p => p.isConnected).length,
      successfulDeliveries: results.filter(r => r.status === "success").length,
      failedDeliveries: results.filter(r => r.status === "failed").length,
    };
  },
});
