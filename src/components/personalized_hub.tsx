import React from "react";
import Vertical_Slider from "./slider";
import { motion } from "framer-motion";
import { Shield, Zap, Target } from "lucide-react";

export default function Personalized_Hub() {
  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#eb0000]/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left Column: Community Stats & Mission */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2
                className="text-white text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8"
                style={{ fontFamily: '"Orbitron", sans-serif' }}
              >
                THE COMMUNITY <br />
                <span className="text-[#eb0000]">COMMAND CENTER</span>
              </h2>
              <p className="text-[#96979c] text-lg md:text-xl font-light leading-relaxed mb-12 border-l-2 border-[#eb0000] pl-8">
                Where 165,000+ athletes converge. My digital ecosystem is engineered for high-level engagement,
                providing brands with unparalleled access to a dedicated performance audience across Instagram and YouTube.
              </p>
            </motion.div>

            <div className="space-y-10">
              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:border-[#eb0000] group-hover:bg-[#eb0000]/10">
                  <Target className="text-[#eb0000] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold uppercase tracking-tight mb-2">ENGAGED AUDIENCE</h3>
                  <p className="text-[#96979c] leading-relaxed font-light">
                    A highly active community of fitness enthusiasts, biohackers, and elite athletes who trust the RahulFitzz methodology for real-world results.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:border-[#eb0000] group-hover:bg-[#eb0000]/10">
                  <Zap className="text-[#eb0000] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold uppercase tracking-tight mb-2">MEDIA IMPACT</h3>
                  <p className="text-[#96979c] leading-relaxed font-light">
                    Delivering millions of monthly impressions through high-production content designed to elevate brand narratives and drive conversion.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:border-[#eb0000] group-hover:bg-[#eb0000]/10">
                  <Shield className="text-[#eb0000] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold uppercase tracking-tight mb-2">BRAND AUTHENTICITY</h3>
                  <p className="text-[#96979c] leading-relaxed font-light">
                    Every partnership is vetted for unshakeable logic and performance value, ensuring seamless integration into the elite RahulFitzz ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-full lg:w-5/12 relative"
          >
            {/* Decorative frame */}
            <div className="absolute -inset-4 border border-white/5 rounded-[3rem] pointer-events-none" />
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
              <Vertical_Slider />
            </div>

            {/* Branded floating tag */}
            <div className="absolute -bottom-6 -right-6 bg-[#eb0000] px-8 py-4 rounded-2xl shadow-xl z-20">
              <span className="text-white font-black uppercase tracking-widest text-xs">RF COMMUNITY HUB</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
