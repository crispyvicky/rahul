"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Timer, Bell } from "lucide-react";
import Link from "next/link";

export default function ComingSoon() {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden px-6">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#eb0000]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#eb0000]/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Grain Overlay */}
            <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 text-center max-w-3xl"
            >
                <div className="flex justify-center mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                        <Timer className="text-[#eb0000] w-8 h-8" />
                    </div>
                </div>

                <span className="text-[#eb0000] text-sm md:text-base tracking-[0.8em] font-black uppercase mb-6 block">
                    Protocol Initialization
                </span>

                <h1
                    className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                    COMING <span className="text-[#eb0000]">SOON</span>
                </h1>

                <p className="text-[#96979c] text-lg md:text-xl font-light leading-relaxed mb-12 max-w-2xl mx-auto">
                    We are currently calibrating the elite training protocols to ensure absolute performance peaks. The evolution is being engineered.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs transition-transform hover:scale-105"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Base
                    </Link>

                    <button className="flex items-center gap-3 px-8 py-4 border border-white/10 bg-white/5 backdrop-blur-xl text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">
                        <Bell className="w-4 h-4" />
                        Notify On Launch
                    </button>
                </div>
            </motion.div>

            {/* Cinematic Footer Text */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
                <span className="text-[10px] tracking-[1em] uppercase font-black">RahulFitzz Elite Systems v1.0.4</span>
            </div>
        </div>
    );
}
