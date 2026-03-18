import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const PLATFORMS = [
  { id: "twitter", name: "X (Twitter)", icon: "𝕏", color: "bg-black", description: "Post tweets to your X account" },
  { id: "linkedin", name: "LinkedIn", icon: "in", color: "bg-blue-700", description: "Share professional updates" },
  { id: "threads", name: "Threads", icon: "T", color: "bg-black", description: "Post to Meta's Threads" },
  { id: "bluesky", name: "Bluesky", icon: "B", color: "bg-sky-500", description: "Share on the decentralized network" },
  { id: "mastodon", name: "Mastodon", icon: "M", color: "bg-indigo-600", description: "Post to the fediverse" },
  { id: "instagram", name: "Instagram", icon: "IG", color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", description: "Share stories and posts" },
];

export function PlatformManager() {
  const platforms = useQuery(api.platforms.list);
  const connect = useMutation(api.platforms.connect);
  const disconnect = useMutation(api.platforms.disconnect);
  const remove = useMutation(api.platforms.remove);

  const [connecting, setConnecting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");

  const getConnectedPlatform = (platformId: string) => {
    return platforms?.find((p: { platform: string; isConnected: boolean }) => p.platform === platformId && p.isConnected);
  };

  const handleConnect = async () => {
    if (!showModal || !handle.trim()) return;
    setConnecting(showModal);
    try {
      await connect({
        platform: showModal,
        displayName: displayName.trim() || handle.trim(),
        handle: handle.trim(),
      });
      setShowModal(null);
      setHandle("");
      setDisplayName("");
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: Id<"platforms">) => {
    await disconnect({ platformId });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Connect Your Platforms</h2>
        <p className="text-gray-400 text-sm md:text-base">Link your social media accounts to broadcast your posts everywhere at once.</p>
      </div>

      <div className="grid gap-3 md:gap-4">
        {PLATFORMS.map(platform => {
          const connected = getConnectedPlatform(platform.id);
          return (
            <div
              key={platform.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all ${
                connected
                  ? "bg-violet-500/10 border-violet-500/30"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center text-white text-lg font-bold shrink-0`}>
                  {platform.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base md:text-lg font-semibold text-white">{platform.name}</h3>
                    {connected && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                        Connected
                      </span>
                    )}
                  </div>
                  {connected ? (
                    <p className="text-sm text-gray-400 truncate">
                      @{connected.handle} · {connected.displayName}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">{platform.description}</p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {connected ? (
                    <>
                      <button
                        onClick={() => handleDisconnect(connected._id)}
                        className="px-3 md:px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowModal(platform.id)}
                      className="px-4 md:px-5 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg ${PLATFORMS.find(p => p.id === showModal)?.color} flex items-center justify-center text-white font-bold`}>
                {PLATFORMS.find(p => p.id === showModal)?.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white">
                Connect {PLATFORMS.find(p => p.id === showModal)?.name}
              </h3>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Enter your account details to connect. In a production app, this would use OAuth authentication.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Handle / Username</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Display Name (optional)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(null);
                  setHandle("");
                  setDisplayName("");
                }}
                className="flex-1 px-4 py-3 text-gray-400 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!handle.trim() || connecting === showModal}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {connecting === showModal ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
