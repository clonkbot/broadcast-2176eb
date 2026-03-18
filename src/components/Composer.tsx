import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

const PLATFORM_INFO: Record<string, { name: string; icon: string; color: string; maxLength: number }> = {
  twitter: { name: "X (Twitter)", icon: "𝕏", color: "bg-black", maxLength: 280 },
  linkedin: { name: "LinkedIn", icon: "in", color: "bg-blue-700", maxLength: 3000 },
  threads: { name: "Threads", icon: "T", color: "bg-black", maxLength: 500 },
  bluesky: { name: "Bluesky", icon: "B", color: "bg-sky-500", maxLength: 300 },
  mastodon: { name: "Mastodon", icon: "M", color: "bg-indigo-600", maxLength: 500 },
  instagram: { name: "Instagram", icon: "IG", color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", maxLength: 2200 },
};

interface ComposerProps {
  connectedPlatforms: Doc<"platforms">[];
}

export function Composer({ connectedPlatforms }: ComposerProps) {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const createPost = useMutation(api.posts.create);
  const simulatePublish = useMutation(api.posts.simulatePublish);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePost = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) return;

    setIsPosting(true);
    try {
      const postId = await createPost({
        content: content.trim(),
        platforms: selectedPlatforms,
      });
      await simulatePublish({ postId });
      setContent("");
      setSelectedPlatforms([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const minMaxLength = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map(p => PLATFORM_INFO[p]?.maxLength || 280))
    : 280;

  const isOverLimit = content.length > minMaxLength;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/90 backdrop-blur-sm text-white px-4 md:px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in text-sm md:text-base">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Posted to {selectedPlatforms.length || "all"} platforms!
        </div>
      )}

      {/* Platform Selection */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-3">Select platforms to post to</label>
        {connectedPlatforms.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <p className="text-gray-400 mb-2 text-sm md:text-base">No platforms connected</p>
            <p className="text-gray-600 text-xs md:text-sm">Connect your social accounts in the Platforms tab to start posting</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 md:gap-3">
            {connectedPlatforms.map(platform => {
              const info = PLATFORM_INFO[platform.platform];
              const isSelected = selectedPlatforms.includes(platform.platform);
              return (
                <button
                  key={platform._id}
                  onClick={() => togglePlatform(platform.platform)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border transition-all text-sm ${
                    isSelected
                      ? "bg-violet-500/20 border-violet-500/50 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md ${info.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {info.icon}
                  </span>
                  <span className="hidden sm:inline">{info.name}</span>
                  <span className="sm:hidden">{platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1, 3)}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share it everywhere..."
          className="w-full h-40 md:h-48 p-4 md:p-6 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base md:text-lg"
        />

        {/* Character Count & Actions */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <span className={`text-xs md:text-sm ${isOverLimit ? "text-red-400" : "text-gray-500"}`}>
              {content.length} / {minMaxLength}
            </span>
            {selectedPlatforms.length > 0 && (
              <span className="text-gray-600 text-xs hidden sm:inline">
                Posting to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <button
            onClick={handlePost}
            disabled={!content.trim() || selectedPlatforms.length === 0 || isPosting || isOverLimit}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2 text-sm md:text-base"
          >
            {isPosting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span className="hidden sm:inline">Broadcasting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Broadcast</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Platform Limits Info */}
      {selectedPlatforms.length > 0 && (
        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <p className="text-xs md:text-sm text-gray-500 mb-2">Character limits per platform:</p>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map(platform => {
              const info = PLATFORM_INFO[platform];
              const isOver = content.length > info.maxLength;
              return (
                <span
                  key={platform}
                  className={`px-2 py-1 rounded text-xs ${
                    isOver ? "bg-red-500/10 text-red-400" : "bg-white/5 text-gray-400"
                  }`}
                >
                  {info.name}: {content.length}/{info.maxLength}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
