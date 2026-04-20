"use client";

import React from "react";
import { motion } from "framer-motion";

export default function VideoCard() {
  const shorts = [
    { id: "6_8cG4WSLJU", title: "Mobility & Strength" },
    { id: "uMSGFvgfE7M", title: "Transformation Blueprint" },
    { id: "wzkcF2IuPHQ", title: "Consistency is Key" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-24 bg-black w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-16 text-center"
        >
          <span className="text-[#eb0000] text-sm tracking-[0.4em] font-bold uppercase mb-4 block">
            @rahulfitzz
          </span>
          <h2
            className="text-white text-4xl md:text-5xl font-black uppercase tracking-widest"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            Latest Shorts
          </h2>
        </motion.div>

        {/* Shorts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center"
        >
          {shorts.map((short, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className="relative w-full max-w-[350px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 border border-white/10 bg-[#111]"
            >
              <iframe
                title={short.title}
                src={`https://www.youtube.com/embed/${short.id}?rel=0&modestbranding=1&controls=1&mute=1&loop=1&playlist=${short.id}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Subscribe CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 flex justify-center"
        >
          <a
            href="https://www.youtube.com/@rahulfitzz"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold tracking-widest uppercase hover:bg-[#eb0000] hover:border-[#eb0000] transition-all duration-300 rounded-full"
          >
            View Full Channel
          </a>
        </motion.div>

      </div>
    </section>
  );
}
