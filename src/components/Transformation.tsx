"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import beforeImg from "../assets/before.jpeg";
import afterImg from "../assets/after.jpg";

export default function Transformation() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <section className="relative w-full bg-[#050505] py-32 overflow-hidden flex flex-col items-center">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20 z-20"
      >
        <span className="text-[#eb0000] text-sm tracking-[0.5em] font-bold uppercase mb-4 block">Proven Results</span>
        <h2
          className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter"
          style={{ fontFamily: '"Orbitron", sans-serif' }}
        >
          THE <span className="text-[#eb0000]">EVOLUTION</span>
        </h2>
      </motion.div>

      {/* Interactive Slider Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10 select-none cursor-ew-resize mx-6 shadow-2xl"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={onMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={onTouchMove}
      >
        {/* After Image (Full Background) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={(afterImg as any)?.src || afterImg}
            alt="After"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-10 right-10 z-20">
            <span className="text-white bg-[#eb0000] px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs shadow-xl">The Result</span>
          </div>
        </div>

        {/* Before Image (Clipped Overlay) */}
        <div
          className="absolute inset-0 w-full h-full z-10"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={(beforeImg as any)?.src || beforeImg}
            alt="Before"
            className="w-full h-full object-cover grayscale brightness-75"
          />
          <div className="absolute bottom-10 left-10 z-20">
            <span className="text-white bg-black/50 backdrop-blur-md px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs border border-white/20 shadow-xl">The Start</span>
          </div>
        </div>

        {/* Draggable Divider */}
        <div
          className="absolute inset-y-0 z-30 w-1 bg-white flex items-center justify-center transition-shadow"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-12 h-12 rounded-full bg-white border-4 border-[#eb0000] flex items-center justify-center shadow-[0_0_40px_rgba(235,0,0,0.5)] transform -translate-x-1/2 group">
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#eb0000]" />
              <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
            </div>
          </div>

          {/* Glow Line */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#eb0000] to-transparent h-full" />
        </div>

        {/* Mobile Instruction */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-60 md:opacity-0 transition-opacity">
          <span className="text-white text-[10px] uppercase font-bold tracking-widest">Slide to verify evolution</span>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-12 text-[#96979c] text-center max-w-2xl px-6 font-light italic leading-relaxed"
      >
        "Transformation is not just physical; it's the manifestation of every early morning and every skipped excuse. Slide to see where the journey began."
      </motion.p>
    </section>
  );
}
