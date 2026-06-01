"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";
import { getAppEntryHref } from "@/lib/app-entry";
import JoinNowHighlight from "@/components/join-now-highlight";
import HeroCutoutImage from "@/components/hero-cutout-image";
import { SOCIAL_REACH_DISPLAY } from "@/lib/social-reach";

// Cinematic Text Reveal Variants
const textVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function Banner() {
  const ref = useRef<HTMLElement>(null);
  const { data: session } = useSession();
  const { user } = useUserStore();
  const appHref = getAppEntryHref(!!session || !!user);
  const [enableScrollFx, setEnableScrollFx] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setEnableScrollFx(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });

  // Desktop-only parallax — on mobile this caused huge black gaps while scrolling
  const contentFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.15, 0]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative w-full lg:min-h-[100dvh] bg-[#050505] overflow-x-hidden flex flex-col justify-center py-16 sm:py-20 lg:py-24"
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        className="relative w-full h-full flex flex-col justify-center"
      >
      {/* 1. LAYER: CSS grain (no external network request) */}
      <div className="absolute inset-0 z-[1] opacity-[0.12] pointer-events-none mix-blend-overlay rf-grain" aria-hidden />

      {/* 2. LAYER: ATMOSPHERIC GRADIENTS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          style={enableScrollFx ? { opacity: glowOpacity } : undefined}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-[#eb0000]/10 blur-[180px] rounded-full animate-pulse z-10"
        />
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-[#050505] via-transparent to-transparent z-20" />
      </div>

      {/* 3. LAYER: BACKGROUND WATERMARK */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 3 }}
        className="absolute bottom-10 right-[-5%] text-[35vw] font-black font-heading pointer-events-none select-none uppercase tracking-tighter leading-none italic text-white z-[5] hidden lg:block"
        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)", color: "transparent" }}
      >
        RF.
      </motion.div>

      {/* Mobile Red Outline Watermark centered behind athlete */}
      <motion.div
        className="absolute top-[26%] sm:top-[24%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14vw] sm:text-[12vw] font-black font-heading uppercase tracking-[0.2em] text-transparent pointer-events-none select-none z-[1] text-center w-full block lg:hidden"
        style={{ WebkitTextStroke: "1px rgba(235, 0, 0, 0.45)" }}
        animate={{ opacity: 0.12 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        DISCIPLINE
      </motion.div>

      {/* Mobile hero — always sharp & full brightness (no fade/blur cycle) */}
      <div className="rf-mobile-hero-wrap absolute left-0 right-0 top-[9%] z-[2] pointer-events-none lg:hidden h-[min(46vh,380px)]">
        <div className="rf-mobile-hero-card relative h-full w-[min(88vw,320px)] max-w-full rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-[1] h-full w-full rf-mobile-hero-img">
            <HeroCutoutImage
              priority
              mobile
              sizes="88vw"
              className="contrast-[1.12] brightness-110 saturate-[1.08]"
            />
          </div>
        </div>
      </div>

      {/* 4. LAYER: CONTENT (2 Column Layout) */}
      <motion.div
        style={
          enableScrollFx
            ? { opacity: contentFade, y: contentY }
            : undefined
        }
        className="relative z-20 flex flex-col lg:flex-row items-center justify-between w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pt-[min(42vh,360px)] sm:pt-[38vh] lg:pt-20 pb-8 gap-12 lg:gap-8 lg:min-h-[85vh]"
      >
        {/* LEFT COLUMN: TEXT (Centered on mobile, left-aligned on desktop) */}
        <div className="flex flex-col items-center lg:items-start justify-center w-full max-w-full lg:w-[52%] text-center lg:text-left mx-auto">
          <div className="w-full lg:opacity-100">
          {/* Pre-Heading Accent - Refined */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="flex items-center justify-center gap-6 mb-8 group w-full"
          >
            <div className="h-[1px] w-16 bg-[#eb0000]/50 group-hover:w-24 transition-all duration-700 hidden lg:block shrink-0" />
            <span className="text-[#eb0000] text-[10px] tracking-[0.8em] font-black uppercase mx-auto lg:mx-0">
              Code of Discipline
            </span>
          </motion.div>

          {/* Main Heading */}
          <div className="relative mb-8 w-full">
            {/* Desktop Heading (single line) */}
            <h1 className="hidden lg:block text-white text-[11.5vw] md:text-[10vw] lg:text-[7.5vw] xl:text-[90px] leading-[0.85] font-black font-heading uppercase tracking-tighter whitespace-nowrap text-left">
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

            {/* Mobile Heading (split on two lines, centered) */}
            <h1 className="block lg:hidden text-white text-[15vw] sm:text-[13vw] leading-[0.9] font-black font-heading uppercase tracking-tight text-center whitespace-normal">
              <div className="block">
                {"RAHUL".split("").map((letter, i) => (
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
              </div>
              <div className="block mt-1">
                {"FITZZ".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    custom={i + 5}
                    variants={textVariant}
                    initial="hidden"
                    animate="visible"
                    className="inline-block transform-gpu"
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </h1>
          </div>

          {/* Subheadline and Description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mb-8 w-full text-center lg:text-left"
          >
            <p className="text-white text-xs md:text-sm lg:text-base font-black font-heading tracking-[0.25em] uppercase mb-3">
              Discipline. Consistency. <span className="text-[#eb0000]">Dominate.</span>
            </p>
            <p className="text-[#96979c] text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto lg:mx-0 second">
              Helping you build a stronger body, sharper mind, and unstoppable discipline.
            </p>
          </motion.div>
          </div>

          {/* Community Proof - Modern Rectangular Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="w-full max-w-full lg:w-auto mb-10 mx-auto bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 rounded-none p-4 sm:p-5 shadow-2xl"
          >
            {/* Desktop Layout (Standard flex row) */}
            <div className="hidden sm:flex flex-row items-center justify-start gap-10 px-4">
              <a href="https://www.instagram.com/rahulfitzz" target="_blank" rel="noopener noreferrer" className="flex flex-col items-start gap-1 hover:scale-105 transition-transform group">
                <div className="text-white font-black font-heading text-2xl tracking-tighter uppercase whitespace-nowrap group-hover:text-[#eb0000] transition-colors">{SOCIAL_REACH_DISPLAY.instagram} IG</div>
                <div className="text-white/50 text-[9px] uppercase tracking-[0.4em] font-bold group-hover:text-white transition-colors">Elite Reach</div>
              </a>
              <div className="w-[1px] h-10 bg-white/10" />
              <a href="https://www.youtube.com/@rahulfitzz" target="_blank" rel="noopener noreferrer" className="flex flex-col items-start gap-1 hover:scale-105 transition-transform group">
                <div className="text-white font-black font-heading text-2xl tracking-tighter uppercase whitespace-nowrap group-hover:text-[#eb0000] transition-colors">{SOCIAL_REACH_DISPLAY.youtube} YT</div>
                <div className="text-white/50 text-[9px] uppercase tracking-[0.4em] font-bold group-hover:text-white transition-colors">Elite Subs</div>
              </a>
              <div className="w-[1px] h-10 bg-white/10" />
              <a href="https://www.facebook.com/profile.php?id=61586274037649" target="_blank" rel="noopener noreferrer" className="flex flex-col items-start gap-1 hover:scale-105 transition-transform group">
                <div className="text-white font-black font-heading text-2xl tracking-tighter uppercase whitespace-nowrap group-hover:text-[#eb0000] transition-colors">{SOCIAL_REACH_DISPLAY.facebook} FB</div>
                <div className="text-white/50 text-[9px] uppercase tracking-[0.4em] font-bold group-hover:text-white transition-colors">Elite Forces</div>
              </a>
            </div>

            {/* Mobile Layout (3 Columns with Red Icons & dividers exactly like screenshot) */}
            <div className="grid grid-cols-3 divide-x divide-white/10 w-full text-center sm:hidden">
              {/* Instagram Stat */}
              <a href="https://www.instagram.com/rahulfitzz" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center px-1 group">
                <svg className="w-5 h-5 text-[#eb0000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span className="text-white font-black font-heading text-sm tracking-tighter mt-2">{SOCIAL_REACH_DISPLAY.instagram}</span>
                <span className="text-white/70 text-[9px] font-bold tracking-wider mt-0.5">IG</span>
                <span className="text-[#96979c] text-[6.5px] font-medium tracking-tight mt-0.5 uppercase">Elite Reach</span>
              </a>

              {/* YouTube Stat */}
              <a href="https://www.youtube.com/@rahulfitzz" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center px-1 group">
                <svg className="w-5 h-5 text-[#eb0000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                </svg>
                <span className="text-white font-black font-heading text-sm tracking-tighter mt-2">{SOCIAL_REACH_DISPLAY.youtube}</span>
                <span className="text-white/70 text-[9px] font-bold tracking-wider mt-0.5">YT</span>
                <span className="text-[#96979c] text-[6.5px] font-medium tracking-tight mt-0.5 uppercase">Elite Subs</span>
              </a>

              {/* Facebook Stat */}
              <a href="https://www.facebook.com/profile.php?id=61586274037649" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center px-1 group">
                <svg className="w-5 h-5 text-[#eb0000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <span className="text-white font-black font-heading text-sm tracking-tighter mt-2">{SOCIAL_REACH_DISPLAY.facebook}</span>
                <span className="text-white/70 text-[9px] font-bold tracking-wider mt-0.5">FB</span>
                <span className="text-[#96979c] text-[6.5px] font-medium tracking-tight mt-0.5 uppercase">Elite Forces</span>
              </a>
            </div>
          </motion.div>

          {/* Action Zone - Rectangular & Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pb-10 sm:pb-0"
          >
            {!session && !user ? (
              <JoinNowHighlight className="w-full sm:w-auto">
                <Link
                  href={appHref}
                  className="group relative min-h-[56px] w-full sm:w-auto px-10 py-5 bg-[#eb0000] text-white font-black text-[10px] md:text-xs uppercase tracking-[0.4em] overflow-hidden rounded-none transition-all duration-500 shadow-[0_0_40px_rgba(235,0,0,0.2)] flex items-center justify-center touch-manipulation no-underline active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Join now{" "}
                    <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden />
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                </Link>
              </JoinNowHighlight>
            ) : (
              <Link
                href={appHref}
                className="group relative min-h-[56px] w-full sm:w-auto px-10 py-5 bg-[#eb0000] text-white font-black text-[10px] md:text-xs uppercase tracking-[0.4em] overflow-hidden rounded-none transition-all duration-500 shadow-[0_0_40px_rgba(235,0,0,0.2)] flex items-center justify-center touch-manipulation no-underline active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Launch App{" "}
                  <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden />
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </Link>
            )}

            <a
              href="#contact"
              className="group min-h-[56px] w-full sm:w-auto px-10 py-5 border border-white/10 bg-transparent text-white font-black text-[10px] md:text-xs uppercase tracking-[0.4em] rounded-none transition-all duration-500 hover:bg-white hover:text-black flex items-center justify-center touch-manipulation text-center no-underline active:scale-[0.98]"
            >
              Collab with me
            </a>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: CUTOUT IMAGE (Visible and LARGER on desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1.12 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="hidden lg:flex w-full lg:w-[48%] justify-center items-center mt-12 lg:mt-0 relative h-[600px] z-10"
        >
          <div className="relative z-10 w-full max-w-[550px] h-[min(600px,70vh)] select-none pointer-events-none mix-blend-screen contrast-125 brightness-110">
            <HeroCutoutImage
              priority
              sizes="(min-width: 1024px) 550px, 0px"
              className="max-w-[550px] mx-auto"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Gym-Themed Scroll Indicator (Moved outside flex layout for perfect centering) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center flex-col gap-3 text-white uppercase text-[9px] tracking-[0.5em] font-black z-30 pointer-events-none"
      >
        Scroll to Explore
        <div className="w-5 h-9 border-2 border-[#eb0000] rounded-full flex justify-center pt-1.5">
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-[#eb0000] rounded-full"
          />
        </div>
      </motion.div>
      </motion.div>
    </section>
  );
}
