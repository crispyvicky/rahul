"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, MapPin, Phone, Mail, User } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GymPrebookModal({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setForm({ name: "", email: "", phone: "", city: "", notes: "" });
    setStatus("idle");
    setErrorMsg("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/gym-prebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "homepage_gym" }),
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/85 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 16, opacity: 0 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#eb0000]" aria-hidden />

            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 text-[#96979c] hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {status === "success" ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 text-[#eb0000] mx-auto mb-5" />
                <h3 className="text-xl font-black uppercase tracking-widest text-white mb-3">
                  You&apos;re on the list
                </h3>
                <p className="text-[#96979c] text-sm leading-relaxed">
                  Thanks for pre-booking. Check your inbox — we&apos;ve sent details on founding-member perks,
                  merch drops, and launch access.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-8 w-full py-3 bg-white text-black font-black text-xs uppercase tracking-[0.25em] hover:bg-[#eb0000] hover:text-white transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="text-[#eb0000] text-[10px] font-black uppercase tracking-[0.35em] mb-2">
                  Opening later this year
                </p>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2 pr-8">
                  Pre-book your spot
                </h2>
                <p className="text-[#96979c] text-sm mb-6 leading-relaxed">
                  Join the founding list for the RahulFitzz training hub. Early members get first access to
                  memberships, merch, and launch offers.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block space-y-1.5">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Full name
                    </span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#eb0000]"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Email
                    </span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#eb0000]"
                      placeholder="you@email.com"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Phone <span className="text-white/25">(optional)</span>
                    </span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#eb0000]"
                      placeholder="+91 …"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> City <span className="text-white/25">(optional)</span>
                    </span>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#eb0000]"
                      placeholder="Where you train"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                      Anything else? <span className="text-white/25">(optional)</span>
                    </span>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#eb0000] resize-none"
                      placeholder="Goals, preferred timing, etc."
                    />
                  </label>

                  {status === "error" && errorMsg && (
                    <p className="text-[#eb0000] text-xs font-bold">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full mt-2 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-[#eb0000] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
