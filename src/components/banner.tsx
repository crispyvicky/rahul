"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

// Cinematic Text Reveal Variants
const textVariant = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(20px)" },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.05,
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function Banner() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Master Cinematic Physics
  const contentFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.15, 0]);

  return (
    <motion.div
      ref={ref}
      id="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[100vh] w-full bg-[#050505] overflow-hidden flex flex-col justify-center py-24"
    >
      {/* 1. LAYER: GRAIN & NOISE TEXTURE */}
      <div className="absolute inset-0 z-[1] opacity-30 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* 2. LAYER: ATMOSPHERIC GRADIENTS (Replacing the image) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          style={{ opacity: glowOpacity }}
          className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-[#eb0000]/10 blur-[180px] rounded-full animate-pulse"
        />
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
      </div>

      {/* 3. LAYER: BACKGROUND WATERMARK */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 3 }}
        className="absolute bottom-10 right-[-5%] text-[35vw] font-black pointer-events-none select-none uppercase tracking-tighter leading-none italic text-white z-[5]"
        style={{ fontFamily: '"Orbitron", sans-serif', WebkitTextStroke: "1px rgba(255,255,255,0.1)", color: "transparent" }}
      >
        RF.
      </motion.div>

      {/* 4. LAYER: CONTENT */}
      <motion.div
        style={{ opacity: contentFade, y: contentY }}
        className="relative z-20 flex flex-col items-start justify-center w-full max-w-7xl mx-auto px-6 md:px-12 pt-20"
      >
        {/* Pre-Heading Accent - Refined */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="flex items-center gap-6 mb-8 group"
        >
          <div className="h-[1px] w-16 bg-[#eb0000]/50 group-hover:w-24 transition-all duration-700" />
          <span className="text-[#eb0000] text-[10px] tracking-[0.8em] font-black uppercase">
            Code of Discipline
          </span>
        </motion.div>

        {/* Main Heading */}
        <div className="relative mb-12">
          <h1
            className="text-white text-[12vw] md:text-[9vw] xl:text-[110px] leading-[0.85] font-black uppercase tracking-tighter"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            {"RAHULFITZZ".split("").map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={textVariant}
                initial="hidden"
                animate="visible"
                className="inline-block transform-gpu"
              >
                {letter}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Community Proof - Influencer Portfolio Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="flex flex-wrap items-center gap-10 mb-16 border-l border-white/5 pl-8"
        >
          <div className="flex flex-col gap-1">
            <div className="text-white font-black text-3xl tracking-tighter uppercase whitespace-nowrap">110K+ IG</div>
            <div className="text-[#eb0000] text-[9px] uppercase tracking-[0.4em] font-black">Elite Reach</div>
          </div>
          <div className="w-[1px] h-10 bg-white/10 hidden sm:block" />
          <div className="flex flex-col gap-1">
            <div className="text-white font-black text-3xl tracking-tighter uppercase whitespace-nowrap">65K+ YT</div>
            <div className="text-[#eb0000] text-[9px] uppercase tracking-[0.4em] font-black">Elite Subs</div>
          </div>
        </motion.div>

        {/* Action Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8 w-full sm:w-auto"
        >
          <a href="/workout-plans" className="group relative px-14 py-7 bg-[#eb0000] text-white font-black text-[10px] md:text-xs uppercase tracking-[0.4em] overflow-hidden transition-all duration-500 shadow-[0_0_40px_rgba(235,0,0,0.2)] flex items-center justify-center">
            <span className="relative z-10 flex items-center gap-4">
              EXPLORE JOURNEY <ArrowRight className="w-4 h-4" />
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
          </a>

          <a href="#contact" className="group px-14 py-7 border border-white/5 bg-white/5 backdrop-blur-3xl text-white font-black text-[10px] md:text-xs uppercase tracking-[0.4em] transition-all duration-500 hover:bg-white hover:text-black flex items-center justify-center">
            COLLAB WITH ME
          </a>
        </motion.div>

        {/* Gym-Themed Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 left-12 hidden lg:flex items-center gap-6 text-white uppercase text-[9px] tracking-[0.6em] font-black rotate-[-90deg] origin-left"
        >
          <div className="flex items-center">
            <div className="w-12 h-[2px] bg-[#eb0000]" />
            <div className="w-3 h-6 border-2 border-[#eb0000] mx-[-1px] rounded-sm" />
            <div className="w-4 h-8 border-2 border-[#eb0000] mx-[-1px] rounded-sm bg-[#eb0000]" />
            <div className="w-3 h-6 border-2 border-[#eb0000] mx-[-1px] rounded-sm" />
          </div>
          SCROLL TO BREACH
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
