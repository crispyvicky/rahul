"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  Dumbbell,
  Users,
  Flame,
  Sparkles,
  MapPin,
  Bot,
  Share2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Features } from "@/components/benefits-cards";
import { features } from "@/rawData";
import { getAppEntryHref } from "@/lib/app-entry";
import { cn } from "@/lib/utils";
import { SOCIAL_REACH_DISPLAY } from "@/lib/social-reach";

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const PLATFORM_PERKS = [
  {
    icon: Trophy,
    title: "Giveaways & Leaderboard",
    description:
      "Earn points for IG follows, referrals, streaks, and workouts — compete for real prizes every month.",
    href: "/giveaways",
  },
  {
    icon: Dumbbell,
    title: "Gym Mode Tracker",
    description:
      "Log sets, reps, and sessions with a built-in workout tracker designed for hypertrophy and strength.",
    href: "/gym-mode",
  },
  {
    icon: Users,
    title: "Elite Community",
    description:
      "Post transformations, get motivated by athletes in Hyderabad and across India, and earn community points.",
    href: "/community",
  },
  {
    icon: Flame,
    title: "Streaks & XP Levels",
    description:
      "Daily login streaks, XP progression, and level tiers — from Recruit to Elite — keep you accountable.",
    href: "/dashboard",
  },
  {
    icon: Bot,
    title: "AI Fitness Coach",
    description:
      "On-demand guidance for training splits, recovery, and nutrition — powered by your RahulFitzz blueprint.",
    href: "/ai-coach",
  },
  {
    icon: MapPin,
    title: "Gym Pre-Booking",
    description:
      "Reserve slots at partner training hubs. Hyderabad-first access with expanding elite facilities.",
    href: "/book-gym",
  },
];

const WHO_ITS_FOR = [
  "Beginners who want structure, not confusion",
  "Intermediate lifters stuck on plateaus",
  "Busy professionals in Hyderabad & India",
  "Athletes chasing aesthetic + performance",
  `Brands seeking authentic fitness reach (${SOCIAL_REACH_DISPLAY.total})`,
];

export default function BenefitsPageContent() {
  const { data: session } = useSession();
  const appHref = getAppEntryHref(!!session);

  return (
    <div className="bg-black min-h-screen pt-28 md:pt-36">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(235,0,0,0.12)_0%,_transparent_55%)] pointer-events-none"
          aria-hidden
        />
        <motion.div
          className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#eb0000]/5 blur-[100px] pointer-events-none"
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 text-center relative z-10"
        >
          <span className="text-[#eb0000] text-xs font-black uppercase tracking-[0.5em] mb-4 block">
            Benefits overview
          </span>
          <h1
            className="text-white text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.95] mb-6"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            THE <span className="text-[#eb0000]">EVOLUTION</span> EDGE
          </h1>
          <p className="text-white text-lg md:text-2xl font-bold italic tracking-tight mb-3 max-w-3xl mx-auto">
            Engineered for those who refuse average.
          </p>
          <p className="text-[#96979c] text-base md:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-10">
            RahulFitzz is a complete fitness system from Hyderabad, India — training blueprints,
            app tools, giveaways, and a community built on discipline and real results.
          </p>
          <Link
            href={appHref}
            className="inline-flex items-center gap-2 bg-[#eb0000] hover:bg-[#c40000] text-white font-black uppercase tracking-[0.2em] text-sm px-8 py-4 transition-colors touch-manipulation"
          >
            {session ? "Launch App" : "Join Free"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Core blueprint benefits + phone */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col md:flex-row xl:flex items-center justify-center gap-12"
        >
          <Features features={features} childVariants={childVariants} />
        </motion.div>
      </section>

      {/* Platform member benefits */}
      <section className="py-20 md:py-28 bg-[#050505] border-y border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 md:px-12"
        >
          <span className="text-[#eb0000] text-xs font-black uppercase tracking-[0.5em] mb-4 block text-center">
            Member platform
          </span>
          <h2
            className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter text-center mb-4"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            WHAT YOU <span className="text-[#eb0000]">UNLOCK</span>
          </h2>
          <p className="text-[#96979c] text-center max-w-2xl mx-auto mb-14 text-lg">
            Free to join. Every tool is designed to turn consistency into visible transformation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={perk.href}
                  className="group block h-full bg-[#090909] border border-white/5 p-6 hover:border-[#eb0000]/40 hover:bg-[#111] transition-all duration-300"
                >
                  <motion.div
                    className="w-12 h-12 flex items-center justify-center border border-white/10 bg-[#1a1a1a] mb-5 group-hover:border-[#eb0000]/50"
                    whileHover={{ scale: 1.05 }}
                  >
                    <perk.icon className="w-6 h-6 text-[#eb0000]" />
                  </motion.div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#eb0000] transition-colors">
                    {perk.title}
                  </h3>
                  <p className="text-[#96979c] text-sm leading-relaxed">{perk.description}</p>
                  <span className="inline-flex items-center gap-1 text-[#eb0000] text-xs font-bold uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Who it's for */}
      <section className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          <motion.div>
            <span className="text-[#eb0000] text-xs font-black uppercase tracking-[0.5em] mb-4 block">
              Built for you
            </span>
            <h2
              className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6"
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              WHO GETS THE <span className="text-[#eb0000]">EDGE</span>
            </h2>
            <p className="text-[#96979c] text-lg leading-relaxed mb-8">
              Whether you train in Hyderabad or follow the blueprint online, RahulFitzz meets you
              where you are — then pushes you past where you thought you could go.
            </p>
            <ul className="space-y-4">
              {WHO_ITS_FOR.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-[#eb0000] shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative border border-white/10 bg-[#090909] p-8 md:p-10"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#eb0000] to-transparent" />
            <Sparkles className="w-8 h-8 text-[#eb0000] mb-4" />
            <h3
              className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight mb-4"
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              Refer &amp; Earn
            </h3>
            <p className="text-[#96979c] leading-relaxed mb-6">
              Invite friends with your unique code. You earn 150 giveaway points per signup — they
              start with a head start on the leaderboard.
            </p>
            <div className="flex items-center gap-3 text-white/80 text-sm border border-white/10 p-4 bg-black/50">
              <Share2 className="w-5 h-5 text-[#eb0000]" />
              <span>Share your link from Giveaways after signing up</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#050505] border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 text-center"
        >
          <h2
            className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            READY TO <span className="text-[#eb0000]">EVOLVE</span>?
          </h2>
          <p className="text-[#96979c] text-lg mb-10">
            Join thousands training with the RahulFitzz blueprint. Free account — full access to
            earn points, track workouts, and grow.
          </p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={session ? "/dashboard" : "/signup"}
              className={cn(
                "inline-flex items-center justify-center gap-2 font-black uppercase tracking-[0.15em] text-sm px-8 py-4 transition-colors touch-manipulation",
                "bg-[#eb0000] hover:bg-[#c40000] text-white"
              )}
            >
              {session ? "Go to Dashboard" : "Create Free Account"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/giveaways"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-[#eb0000] text-white font-bold uppercase tracking-[0.15em] text-sm px-8 py-4 transition-colors touch-manipulation"
            >
              <Trophy className="w-4 h-4 text-[#eb0000]" />
              Explore Giveaways
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

