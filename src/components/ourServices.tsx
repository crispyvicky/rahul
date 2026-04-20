import React from "react";
import { activities } from "../rawData";
import { motion } from "framer-motion";

export default function Services() {
  return (
    <motion.section
      id="services"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="pt-24 bg-[#0a0a0a]"
    >
      <div className="max-w-5xl mx-auto px-6 mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontFamily: '"Orbitron", sans-serif' }}
          className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest mb-6"
        >
          Brand <span className="text-[#eb0000]">Portfolio</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[#96979c] text-lg md:text-xl font-light leading-relaxed max-w-4xl mx-auto"
        >
          Leveraging a combined network of 165K+ dedicated followers, I bridge the gap between world-class fitness and elite brand storytelling.
          This isn’t just content—it’s a global movement.
        </motion.p>
      </div>

      <div className="flex flex-col md:flex-row w-full h-[60vh] md:h-[70vh]">
        {activities.map((item, index) => (
          <FitnessPanel key={index} activity={(item as any).activity || item.text} text={item.text} imageUrl={item.imageUrl} index={index} />
        ))}
      </div>
    </motion.section>
  );
}

const FitnessPanel = ({ activity, text, imageUrl, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="relative flex-1 md:h-full h-32 overflow-hidden group cursor-pointer border-y md:border-y-0 md:border-r border-white/5 last:border-r-0 bg-black flex items-end"
  >
    <img
      src={(imageUrl as any)?.src || imageUrl}
      alt={activity}
      className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 opacity-40 group-hover:opacity-80 sepia-[0.3]"
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative z-10 p-6 md:p-8 w-full transform transition-transform duration-500 group-hover:-translate-y-4">
      <span className="text-[#eb0000] text-sm font-bold tracking-[0.2em] mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        0{index + 1}
      </span>
      <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-wider" style={{ fontFamily: '"Orbitron", sans-serif' }}>
        {text}
      </h3>
    </div>
  </motion.div>
);
