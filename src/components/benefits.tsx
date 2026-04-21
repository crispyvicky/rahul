import React from "react";
import { Features } from "./benefits-cards";
import { features } from "../rawData";
import { motion } from "framer-motion";
function Benefits() {
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5,
        staggerChildren: 0.5,
      },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 2,
      },
    },
  };

  return (
    <div id="benefits" className=" bg-black text-white p-6 md:px-12 xl:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-white text-4xl md:text-7xl font-black text-center uppercase tracking-tighter"
          style={{ fontFamily: '"Orbitron", sans-serif' }}
        >
          THE <span className="text-[#eb0000]">EVOLUTION</span> EDGE
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-white text-xl md:text-2xl font-bold italic tracking-tight mb-2">
            Engineered for those who refuse average.
          </p>
          <p className="text-[#96979c] text-lg md:text-xl font-light leading-relaxed max-w-4xl mx-auto">
            Built on real-world training, discipline, and results—RahulFitzz is more than fitness.
            It’s a system designed to transform your physique, mindset, and performance with precision.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="flex flex-col md:flex-row xl:flex items-center justify-center gap-12 py-12"
        >
          <Features features={features} childVariants={childVariants} />
        </motion.div>
      </div>
    </div>
  );
}

export default Benefits;
