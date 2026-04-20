import React from "react";
import { motion } from "framer-motion";

const Banner_Marquee = () => {
  const content = [
    "TRANSFORMATION",
    "MOTIVATION",
    "PROGRESS",
    "STRENGTH",
    "COMMUNITY",
    "THE BLUEPRINT",
    "EVOLUTION"
  ];

  return (
    <div className="w-full bg-[#050505] py-12 md:py-20 overflow-hidden relative border-y border-white/5">

      <div className="flex flex-col gap-6 md:gap-10">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 md:gap-24 items-center"
        >
          {[...content, ...content, ...content].map((item, index) => (
            <span
              key={index}
              style={{ fontFamily: '"Orbitron", sans-serif' }}
              className="text-white/40 text-4xl md:text-8xl font-black italic tracking-tighter hover:text-[#eb0000] transition-colors duration-500"
            >
              {item}
            </span>
          ))}
        </motion.div>

        <motion.div
          animate={{ x: [-1000, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 md:gap-24 items-center"
        >
          {[...content, ...content, ...content].map((item, index) => (
            <span
              key={index}
              style={{ fontFamily: '"Orbitron", sans-serif' }}
              className="text-[#eb0000]/40 text-4xl md:text-8xl font-black italic tracking-tighter hover:text-white transition-colors duration-500"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Banner_Marquee;
