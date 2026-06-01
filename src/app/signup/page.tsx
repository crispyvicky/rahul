"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowRight, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/use-user-store";
import { mapDbProfileToStore } from "@/lib/user-profile-mapper";
import { GIVEAWAY_POINT_ACTIONS } from "@/lib/giveaway-points-config";

const REF_KEY = "rahulfitzz_ref";

function SignupForm() {
  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get("ref")?.trim() || "";

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(refFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useUserStore();

  useEffect(() => {
    if (refFromUrl) {
      sessionStorage.setItem(REF_KEY, refFromUrl.toUpperCase());
      setReferralCode(refFromUrl.toUpperCase());
    }
  }, [refFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          referralCode: referralCode.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Signup failed");
        return;
      }

      if (json.profile) {
        login(
          mapDbProfileToStore({
            id: json.profile.id,
            name: json.profile.name,
            email: json.profile.email,
            avatar_url: "",
            instagram_handle: "",
            is_premium: false,
            premium_tier: "free",
            xp_points: 0,
            giveaway_points: 0,
            referral_code: json.profile.referralCode,
            current_streak: 0,
            longest_streak: 0,
            onboarding_completed: false,
            onboarding_data: null,
            google_id: "",
            referred_by: referralCode || null,
            is_following_ig: false,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        );
      }
      router.push("/onboarding");
    } catch {
      setError("Signup failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
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
            Get a personalized AI coach, track every rep, compete in challenges, and join the most elite
            fitness community.
          </p>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-card p-6 sm:p-8 min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <motion.div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-white font-heading font-bold text-xl">RahulFitzz</span>
          </div>

          <h2 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2 font-heading">
            Create <span className="text-brand">Account</span>
          </h2>
          <p className="text-text-secondary text-sm mb-10">
            Join the elite. Start your transformation today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div className="space-y-2">
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
            </motion.div>

            <motion.div className="space-y-2">
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
            </motion.div>

            <motion.div className="space-y-2">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
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
            </motion.div>

            <motion.div className="space-y-2">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em]">
                Referral code (optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="RF-XXXX-XXXX"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-brand transition-all uppercase"
              />
              {refFromUrl && (
                <p className="text-emerald-400/90 text-xs">
                  Referrer gets +{GIVEAWAY_POINT_ACTIONS.refer.points} pts when you join.
                </p>
              )}
            </motion.div>

            {error && <p className="text-brand text-sm">{error}</p>}

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

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-white">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
