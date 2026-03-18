import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Social media platform connections
  platforms: defineTable({
    userId: v.id("users"),
    platform: v.string(), // twitter, linkedin, threads, bluesky, mastodon, instagram
    displayName: v.string(),
    handle: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    isConnected: v.boolean(),
    connectedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_platform", ["userId", "platform"]),

  // Posts created by users
  posts: defineTable({
    userId: v.id("users"),
    content: v.string(),
    mediaUrls: v.optional(v.array(v.string())),
    status: v.string(), // draft, scheduled, publishing, published, failed
    scheduledFor: v.optional(v.number()),
    createdAt: v.number(),
    publishedAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_scheduled", ["scheduledFor"]),

  // Individual platform post results
  postResults: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    platform: v.string(),
    status: v.string(), // pending, success, failed
    platformPostId: v.optional(v.string()),
    platformUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
  }).index("by_post", ["postId"])
    .index("by_user", ["userId"]),

  // User settings/preferences
  userSettings: defineTable({
    userId: v.id("users"),
    defaultPlatforms: v.array(v.string()),
    timezone: v.optional(v.string()),
    autoThread: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),
});
