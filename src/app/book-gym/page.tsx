"use client";

import { motion } from "framer-motion";
import { MapPin, Timer, Gift } from "lucide-react";
import { GymPrebookForm } from "@/components/gym-prebook-form";

export default function BookGymPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <p className="text-brand text-[10px] font-black uppercase tracking-[0.4em] mb-2">
          Opening later this year
        </p>
        <h1 className="text-white text-3xl sm:text-4xl font-black font-heading uppercase tracking-tight mb-3">
          Gym <span className="text-brand">Booking</span>
        </h1>
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          Pre-book your spot at the RahulFitzz training hub. Founding members get priority access,
          merch drops, and launch pricing.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <GymPrebookForm source="app_book_gym" />

        <div className="space-y-4">
          {[
            {
              icon: Timer,
              title: "Launch priority",
              text: "First in line when doors open — we email you before the public announcement.",
            },
            {
              icon: Gift,
              title: "Founding perks",
              text: "Exclusive membership pricing, RahulFitzz gym merch, and launch event access.",
            },
            {
              icon: MapPin,
              title: "Elite facility",
              text: "Equipment and atmosphere built to the RahulFitzz standard — not a generic gym.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-surface-card border border-white/10 rounded-2xl p-5 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-text-secondary text-xs leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
