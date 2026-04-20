"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Send, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brand: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/collab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-[2rem] border border-[#eb0000]/20"
      >
        <CheckCircle className="w-16 h-16 text-[#eb0000] mb-6" />
        <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-4">Message Sent</h3>
        <p className="text-[#96979c] text-lg font-light leading-relaxed">
          The transmission was successful. Rahul will review your collaboration request and respond shortly.
          <br /><span className="text-white/40 text-sm mt-4 block">Check your inbox for a confirmation.</span>
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-8 text-[#eb0000] text-xs font-black uppercase tracking-[0.4em] hover:text-white transition-colors"
        >
          Send Another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Full Name</label>
          <input
            required
            type="text"
            placeholder="ENTER NAME"
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#eb0000] transition-colors"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Email Address</label>
          <input
            required
            type="email"
            placeholder="EMAIL@DOMAIN.COM"
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#eb0000] transition-colors"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Brand / Company</label>
        <input
          required
          type="text"
          placeholder="BRAND NAME"
          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#eb0000] transition-colors"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Collaboration Details</label>
        <textarea
          required
          rows={4}
          placeholder="TELL ME ABOUT YOUR PROJECT..."
          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#eb0000] transition-colors resize-none"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full group relative px-10 py-6 bg-[#eb0000] text-white font-black text-xs uppercase tracking-[0.4em] overflow-hidden transition-all duration-500 disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center gap-4">
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>SEND TRANSMISSION <Send className="w-4 h-4" /></>
          )}
        </span>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      </button>

      {status === "error" && (
        <p className="text-[#eb0000] text-[10px] uppercase font-black tracking-widest text-center mt-4">
          Transmission Failed. Please try again or email directly.
        </p>
      )}
    </form>
  );
}
