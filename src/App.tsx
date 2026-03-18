import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-600/5 to-cyan-600/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-4 md:mb-6 shadow-2xl shadow-violet-500/25">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,6 12,2 8,6" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            Broadcast
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Post everywhere, all at once</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">
            {flow === "signIn" ? "Welcome back" : "Create your account"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                flow === "signIn" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="w-full text-center text-gray-400 hover:text-white transition-colors text-sm"
            >
              {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
              <span className="text-violet-400 hover:text-violet-300 font-medium">
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>
        </div>

        {/* Platform icons */}
        <div className="mt-8 md:mt-10 flex justify-center gap-4 md:gap-6 opacity-40">
          {["X", "in", "T", "B", "M", "IG"].map((icon, i) => (
            <div
              key={icon}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/60 text-xs md:text-sm font-mono"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16,6 12,2 8,6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <SignIn />;
  return <Dashboard />;
}
