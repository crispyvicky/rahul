"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, Phone, Mail, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";

type Props = {
  source?: string;
  className?: string;
};

export function GymPrebookForm({ source = "app_book_gym", className = "" }: Props) {
  const { data: session } = useSession();
  const { user } = useUserStore();

  const [form, setForm] = useState({
    name: session?.user?.name || user?.name || "",
    email: session?.user?.email || user?.email || "",
    phone: "",
    city: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/gym-prebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(typeof data.error === "string" ? data.error : "Could not submit. Try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={`bg-surface-card border border-white/10 rounded-2xl p-8 text-center ${className}`}>
        <CheckCircle2 className="w-14 h-14 text-brand mx-auto mb-4" />
        <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">
          You&apos;re on the list
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          Thanks for pre-booking. Check your inbox for founding-member perks, merch drops, and launch access.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-surface-card border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 ${className}`}
    >
      <label className="block space-y-1.5">
        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
          <User className="w-3 h-3" /> Full name
        </span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand"
          placeholder="Your name"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Mail className="w-3 h-3" /> Email
        </span>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand"
          placeholder="you@email.com"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Phone className="w-3 h-3" /> Phone <span className="opacity-50">(optional)</span>
        </span>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand"
          placeholder="+91 …"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> City <span className="opacity-50">(optional)</span>
        </span>
        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand"
          placeholder="Where you train"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">
          Notes <span className="opacity-50">(optional)</span>
        </span>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand resize-none"
          placeholder="Goals, preferred timing…"
        />
      </label>
      {status === "error" && errorMsg && (
        <p className="text-brand text-xs font-bold">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Securing your spot…
          </>
        ) : (
          "Pre-book now"
        )}
      </button>
    </form>
  );
}
