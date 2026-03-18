import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

const PLATFORM_INFO: Record<string, { name: string; icon: string; color: string }> = {
  twitter: { name: "X", icon: "𝕏", color: "bg-black" },
  linkedin: { name: "LinkedIn", icon: "in", color: "bg-blue-700" },
  threads: { name: "Threads", icon: "T", color: "bg-black" },
  bluesky: { name: "Bluesky", icon: "B", color: "bg-sky-500" },
  mastodon: { name: "Mastodon", icon: "M", color: "bg-indigo-600" },
  instagram: { name: "Instagram", icon: "IG", color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" },
};

export function PostHistory() {
  const posts = useQuery(api.posts.list);
  const [expandedPost, setExpandedPost] = useState<Id<"posts"> | null>(null);

  if (posts === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 md:py-20">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No posts yet</h3>
        <p className="text-gray-500 text-sm md:text-base">Your broadcast history will appear here after you create your first post.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Post History</h2>
        <p className="text-gray-400 text-sm md:text-base">Track all your broadcasts and their delivery status.</p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {posts.map((post: { _id: Id<"posts">; content: string; status: string; createdAt: number; publishedAt?: number }) => (
          <PostCard
            key={post._id}
            post={post}
            isExpanded={expandedPost === post._id}
            onToggle={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
          />
        ))}
      </div>
    </div>
  );
}

function PostCard({
  post,
  isExpanded,
  onToggle
}: {
  post: { _id: Id<"posts">; content: string; status: string; createdAt: number; publishedAt?: number };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const results = useQuery(api.posts.getResults, { postId: post._id });

  const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Draft" },
    scheduled: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Scheduled" },
    publishing: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Publishing" },
    published: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Published" },
    failed: { bg: "bg-red-500/20", text: "text-red-400", label: "Failed" },
  };

  const style = statusStyles[post.status] || statusStyles.draft;

  const successCount = results?.filter((r: { status: string }) => r.status === "success").length || 0;
  const failedCount = results?.filter((r: { status: string }) => r.status === "failed").length || 0;
  const totalCount = results?.length || 0;

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
      <button
        onClick={onToggle}
        className="w-full p-4 md:p-5 text-left"
      >
        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 ${style.bg} ${style.text} text-xs rounded-full`}>
                {style.label}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-white text-sm md:text-base line-clamp-2">{post.content}</p>

            {totalCount > 0 && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-emerald-400">{successCount} delivered</span>
                {failedCount > 0 && (
                  <span className="text-xs text-red-400">{failedCount} failed</span>
                )}
              </div>
            )}
          </div>

          <svg
            className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {isExpanded && results && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 border-t border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 pt-4">Platform Results</p>
          <div className="grid gap-2">
            {results.map((result: { _id: string; platform: string; status: string; platformUrl?: string; errorMessage?: string }) => {
              const platform = PLATFORM_INFO[result.platform];
              return (
                <div
                  key={result._id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    result.status === "success"
                      ? "bg-emerald-500/10"
                      : result.status === "failed"
                      ? "bg-red-500/10"
                      : "bg-white/5"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${platform?.color || "bg-gray-600"} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {platform?.icon || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{platform?.name || result.platform}</p>
                    {result.status === "success" && result.platformUrl && (
                      <p className="text-xs text-gray-500 truncate">{result.platformUrl}</p>
                    )}
                    {result.status === "failed" && result.errorMessage && (
                      <p className="text-xs text-red-400">{result.errorMessage}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {result.status === "success" && (
                      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {result.status === "failed" && (
                      <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    )}
                    {result.status === "pending" && (
                      <div className="w-5 h-5 border-2 border-gray-500/30 border-t-gray-400 rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
