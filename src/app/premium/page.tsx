"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Check, ArrowRight, Sparkles, Star, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "warrior",
    name: "Warrior",
    price: 499,
    period: "/month",
    popular: false,
    features: [
      "AI Workout Plans",
      "AI Diet Plans",
      "Gym Mode Tracker",
      "Community Access",
      "7-Day Challenges",
      "Basic Analytics",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 999,
    period: "/month",
    popular: true,
    features: [
      "Everything in Warrior",
      "AI Physique Analyzer",
      "30-Day Challenges",
      "Priority Leaderboard",
      "Instagram Growth Tools",
      "Advanced Analytics",
      "Weekly Plan Adaption",
    ],
  },
  {
    id: "custom",
    name: "Custom Blueprint",
    price: 2999,
    period: "/month",
    popular: false,
    features: [
      "Everything in Elite",
      "1-on-1 Coaching with Rahul",
      "Monthly Video Consultations",
      "Custom Meal Plans",
      "Private Community Group",
      "Competition Prep Support",
      "Direct WhatsApp Access",
    ],
  },
];

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState("elite");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      <div className="text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-yellow-400" />
        </div>
        <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
          Go <span className="text-brand">Premium</span>
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          Unlock the full RahulFitzz ecosystem. AI coaching, physique analysis, and direct access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedPlan(plan.id)}
            className={cn(
              "relative bg-surface-card border rounded-2xl p-5 sm:p-6 cursor-pointer transition-all",
              selectedPlan === plan.id
                ? "border-brand shadow-[0_0_40px_rgba(235,0,0,0.15)]"
                : "border-white/5 hover:border-white/10"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand rounded-full text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Most Popular
              </div>
            )}
            <h3 className="text-white font-bold text-lg uppercase tracking-wider mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-brand text-3xl font-black font-heading">₹{plan.price}</span>
              <span className="text-text-muted text-xs">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <button
              className={cn(
                "w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                selectedPlan === plan.id
                  ? "bg-brand hover:bg-brand-dark text-white hover:shadow-[0_0_20px_rgba(235,0,0,0.3)]"
                  : "bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 hover:text-white"
              )}
            >
              {selectedPlan === plan.id ? (
                <>Subscribe <ArrowRight className="w-4 h-4" /></>
              ) : (
                "Select Plan"
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-text-muted text-xs">
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Secure Payments</span>
        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Cancel Anytime</span>
        <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> 7-Day Free Trial</span>
      </div>
    </div>
  );
}
