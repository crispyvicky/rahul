"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Flame, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("admin", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Invalid admin credentials");
    }
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/admin" });
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand mx-auto flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter font-heading">
            Command Center
          </h1>
          <p className="text-text-muted text-sm mt-2">Authorized personnel only</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 space-y-5"
        >
          {error && <p className="text-brand text-sm font-medium">{error}</p>}
          <div>
            <label className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-brand outline-none"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-brand outline-none"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enter Command Center"}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <p className="relative text-center text-text-muted text-[10px] uppercase tracking-widest bg-[#0a0a0a] px-2 mx-auto w-fit">
              or
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10"
          >
            Google (allowlisted admin email)
          </button>
        </form>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 mt-8 text-text-muted text-xs font-bold uppercase tracking-widest hover:text-white no-underline"
        >
          <Flame className="w-3.5 h-3.5" /> Back to athlete app
        </Link>
      </div>
    </div>
  );
}
