import React from "react";
import { levels_list } from "../rawData";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Work_Out_Plan = () => {
  return (
    <div className="min-h-screen bg-[#050505] py-24 relative overflow-hidden" id="programs">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="text-[#eb0000] text-sm tracking-[0.4em] font-bold uppercase mb-4 block">Program Selection</span>
          <h2 className="text-white text-4xl md:text-7xl font-black uppercase tracking-tighter" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            CHOOSE YOUR <span className="text-[#eb0000]">EVOLUTION</span>
          </h2>
          <p className="text-[#96979c] text-lg font-light mt-6 max-w-2xl leading-relaxed border-l-2 border-[#eb0000]/30 pl-6">
            Every athlete has a different starting point, but we all share the same destination: Peak Performance. Select the protocol that matches your current grit.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {levels_list.map((level, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative h-[600px] rounded-[2rem] overflow-hidden border border-white/10 hover:border-[#eb0000]/50 transition-all duration-700 shadow-2xl"
            >
              {/* Image Layer */}
              <img
                src={(level.image as any)?.src || level.image}
                alt={level.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40 opacity-80 group-hover:opacity-60 transition-opacity duration-700" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-8 transform transition-transform duration-500 group-hover:-translate-y-4">
                <span className="text-[#eb0000] text-xs font-black tracking-[0.3em] uppercase mb-2 block">Level 0{index + 1}</span>
                <h3 className="text-white text-2xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                  {level.title}
                </h3>
                <p className="text-[#dcdcdc] text-sm font-light leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {level.description}
                </p>

                <button className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest group/btn">
                  Start Program
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-2" />
                </button>
              </div>

              {/* Branded Label */}
              <div className="absolute top-8 left-8 p-3 bg-[#eb0000]/10 backdrop-blur-3xl border border-[#eb0000]/20 rounded-xl">
                <span className="text-[#eb0000] text-[10px] font-black uppercase tracking-widest">RF PRO</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work_Out_Plan;
