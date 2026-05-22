"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Flame, ArrowRight, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { login } = useUserStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.ok) {
        login({ ...DEMO_USER, email, name: email.split("@")[0] || "Athlete" });
        router.push("/dashboard");
      }
    } catch {
      login({ ...DEMO_USER, email, name: email.split("@")[0] || "Athlete" });
      router.push("/dashboard");
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
      {/* Left — Branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-brand/10 blur-[150px] rounded-full" />
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
            Train.<br />
            <span className="text-brand">Transform.</span><br />
            Dominate.
          </h1>
          <p className="text-text-secondary text-lg font-light leading-relaxed">
            Join 165,000+ athletes in the most elite fitness ecosystem.
            AI-powered coaching, real-time tracking, and a community that pushes limits.
          </p>
          <div className="flex gap-8 mt-12">
            <div>
              <p className="text-white text-2xl font-black">130K+</p>
              <p className="text-text-secondary text-xs uppercase tracking-widest">IG Athletes</p>
            </div>
            <div>
              <p className="text-white text-2xl font-black">50K+</p>
              <p className="text-text-secondary text-xs uppercase tracking-widest">Transformed</p>
            </div>
            <div>
              <p className="text-white text-2xl font-black">4.9★</p>
              <p className="text-text-secondary text-xs uppercase tracking-widest">Rated</p>
            </div>
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
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-heading font-bold text-xl">RahulFitzz</span>
          </div>

          <h2 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2 font-heading">
            Welcome <span className="text-brand">Back</span>
          </h2>
          <p className="text-text-secondary text-sm mb-8">
            Sign in to access your fitness ecosystem
          </p>

          {/* Google Sign-In — PRIMARY */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-4 bg-white hover:bg-gray-100 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 mb-4 shadow-lg"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-text-muted text-xs uppercase tracking-widest">or email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-brand transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-brand transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-text-secondary text-sm text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand font-bold hover:text-brand-light transition-colors">Sign Up</Link>
          </p>
          <Link href="/" className="block text-center text-text-muted text-xs mt-4 hover:text-text-secondary transition-colors no-underline">
            ← Back to RahulFitzz.com
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
