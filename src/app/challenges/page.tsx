"use client";

import { motion } from "framer-motion";
import { Swords, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ChallengesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center pb-20">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-6"
      >
        <Swords className="w-10 h-10 text-brand" />
      </motion.div>
      <h1 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter font-heading mb-3">
        Challenges <span className="text-brand">Coming Soon</span>
      </h1>
      <p className="text-text-secondary text-sm max-w-md leading-relaxed mb-2">
        Squad challenges, leaderboards, and daily check-ins are being wired to the database.
      </p>
      <p className="text-text-muted text-xs flex items-center justify-center gap-2 mb-8">
        <Clock className="w-3.5 h-3.5" /> Next sprint
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/giveaways"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-bold text-xs uppercase tracking-widest rounded-xl no-underline hover:bg-brand-dark transition-colors"
        >
          Earn giveaway points <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/gym-mode"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl no-underline hover:bg-white/10 transition-colors"
        >
          Gym Mode
        </Link>
      </div>
    </div>
  );
}
