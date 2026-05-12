"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowRight, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login({
        ...DEMO_USER,
        name,
        email,
        onboardingCompleted: false,
        onboardingData: null,
        xpPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
      router.push("/onboarding");
    }, 800);
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
      {/* Left — Branding (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand/10 blur-[180px] rounded-full" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-md px-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center mb-8">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-5xl font-black uppercase tracking-tighter leading-none mb-6 font-heading">
            Your<br />
            Evolution<br />
            <span className="text-brand">Starts Now.</span>
          </h1>
          <p className="text-text-secondary text-lg font-light leading-relaxed">
            Get a personalized AI coach, track every rep, compete in challenges, 
            and join the most elite fitness community.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {["AI Coach", "Live Tracking", "Challenges", "Community", "Gym Mode"].map((f) => (
              <span
                key={f}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-text-secondary text-xs font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-card p-6 sm:p-8 min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-heading font-bold text-xl">RahulFitzz</span>
          </div>

          <h2 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2 font-heading">
            Create <span className="text-brand">Account</span>
          </h2>
          <p className="text-text-secondary text-sm mb-10">
            Join the elite. Start your transformation today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(235,0,0,0.3)]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Begin Evolution <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-text-muted text-[10px] text-center mt-6 leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>

          <p className="text-text-secondary text-sm text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand font-bold hover:text-brand-light transition-colors">
              Sign In
            </Link>
          </p>

          <Link
            href="/"
            className="block text-center text-text-muted text-xs mt-6 hover:text-text-secondary transition-colors no-underline"
          >
            ← Back to RahulFitzz.com
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
