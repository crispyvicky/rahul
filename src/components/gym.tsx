"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Timer, MapPin } from "lucide-react";
import { GymPrebookModal } from "./gym-prebook-modal";

export default function Gym() {
  const [prebookOpen, setPrebookOpen] = useState(false);

  return (
    <section id="gym-prebook" className="py-40 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#eb0000]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#eb0000]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative inline-block mb-12"
        >
          <div className="absolute inset-0 bg-[#eb0000]/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-black border border-white/10 flex items-center justify-center">
            <Lock className="text-[#eb0000] w-10 h-10 md:w-14 md:h-14" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#eb0000] text-sm md:text-base tracking-[0.6em] font-bold uppercase mb-4 block">
            The Expansion
          </span>
          <h2
            className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            OFFICIAL <span className="text-[#eb0000]">TRAINING</span> HUB
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mt-12">
            <div className="flex items-center gap-4 text-white/40 uppercase tracking-widest font-black text-xs md:text-sm">
              <Timer size={18} className="text-[#eb0000]" />
              Opening later this year
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-white/10" />
            <div className="flex items-center gap-4 text-white/40 uppercase tracking-widest font-black text-xs md:text-sm">
              <MapPin size={18} className="text-[#eb0000]" />
              Premium facility — RahulFitzz standard
            </div>
          </div>

          <p className="text-[#96979c] mt-12 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            We&apos;re building a physical home for the community — elite equipment, the right atmosphere,
            and coaching that matches the app. Pre-book now to lock in founding-member perks before doors open.
          </p>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPrebookOpen(true)}
            className="mt-16 px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs transition-colors hover:bg-[#eb0000] hover:text-white"
          >
            Pre-book your spot
          </motion.button>
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none opacity-[0.02] select-none">
          <h3 className="text-[200px] md:text-[400px] font-black text-white leading-none">HUB</h3>
        </div>
      </div>

      <GymPrebookModal open={prebookOpen} onOpenChange={setPrebookOpen} />
    </section>
  );
}
