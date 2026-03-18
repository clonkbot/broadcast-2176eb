import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Composer } from "./Composer";
import { PlatformManager } from "./PlatformManager";
import { PostHistory } from "./PostHistory";

type Tab = "compose" | "platforms" | "history";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("compose");
  const stats = useQuery(api.posts.getStats);
  const platforms = useQuery(api.platforms.list);

  const connectedPlatforms = platforms?.filter((p: { isConnected: boolean }) => p.isConnected) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,6 12,2 8,6" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-display text-lg md:text-xl font-bold text-white">Broadcast</span>
            </div>

            <button
              onClick={() => signOut()}
              className="px-3 py-2 md:px-4 text-xs md:text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {stats && (
        <div className="relative z-10 border-b border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex gap-4 md:gap-8 overflow-x-auto pb-1 scrollbar-hide">
              <StatItem label="Posts" value={stats.totalPosts} />
              <StatItem label="Published" value={stats.publishedPosts} color="green" />
              <StatItem label="Scheduled" value={stats.scheduledPosts} color="blue" />
              <StatItem label="Platforms" value={stats.connectedPlatforms} color="violet" />
              <StatItem label="Delivered" value={stats.successfulDeliveries} color="cyan" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-1">
            <TabButton active={activeTab === "compose"} onClick={() => setActiveTab("compose")}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline">Compose</span>
            </TabButton>
            <TabButton active={activeTab === "platforms"} onClick={() => setActiveTab("platforms")}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <span className="hidden sm:inline">Platforms</span>
              <span className="ml-1.5 px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                {connectedPlatforms.length}
              </span>
            </TabButton>
            <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="hidden sm:inline">History</span>
            </TabButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {activeTab === "compose" && <Composer connectedPlatforms={connectedPlatforms} />}
          {activeTab === "platforms" && <PlatformManager />}
          {activeTab === "history" && <PostHistory />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-center text-gray-600 text-xs">
            Requested by <span className="text-gray-500">@web-user</span> · Built by <span className="text-gray-500">@clonkbot</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ label, value, color = "white" }: { label: string; value: number; color?: string }) {
  const colorClasses: Record<string, string> = {
    white: "text-white",
    green: "text-emerald-400",
    blue: "text-blue-400",
    violet: "text-violet-400",
    cyan: "text-cyan-400",
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className={`text-lg md:text-2xl font-bold ${colorClasses[color]}`}>{value}</span>
      <span className="text-xs md:text-sm text-gray-500">{label}</span>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
        active
          ? "text-white border-violet-500"
          : "text-gray-500 border-transparent hover:text-gray-300 hover:border-white/10"
      }`}
    >
      {children}
    </button>
  );
}
