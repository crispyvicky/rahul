import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { faqs } from "../rawData";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/img/RF.png";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }
    },
  };

  return (
    <div
      id="faq"
      className="w-full px-6 md:px-[15%] py-24 md:py-32 bg-[#050505] relative overflow-hidden border-t border-white/5"
    >
      {/* Branded Watermarks (Replacing legacy GH logo) */}
      <div className="absolute top-1/2 -left-20 -translate-y-1/2 opacity-5 pointer-events-none select-none">
        <img src={(logo as any)?.src || logo} alt="" className="w-[400px] h-auto grayscale" />
      </div>
      <div className="absolute top-1/2 -right-20 -translate-y-1/2 opacity-5 pointer-events-none select-none rotate-12">
        <img src={(logo as any)?.src || logo} alt="" className="w-[500px] h-auto grayscale" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="text-[#eb0000] text-sm tracking-[0.4em] font-bold uppercase mb-4 block">Information Hub</span>
          <h2
            className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            THE <span className="text-[#eb0000]">BLUEPRINT</span> FAQ
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              {...faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              childVariants={childVariants}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function FaqItem({ question, answer, isOpen, onToggle, childVariants }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  childVariants: any;
}) {
  return (
    <motion.div
      variants={childVariants}
      className={`group border border-white/5 transition-all duration-500 overflow-hidden rounded-2xl ${isOpen ? "bg-white/[0.03] border-[#eb0000]/30 shadow-2xl" : "bg-[#0a0a0a] hover:border-white/20"
        }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between px-8 py-6 md:py-8"
      >
        <span className="text-white text-sm md:text-lg font-bold uppercase tracking-wide group-hover:text-[#eb0000] transition-colors duration-300">
          {question}
        </span>
        <div className={`p-2 rounded-full transition-all duration-500 ${isOpen ? "bg-[#eb0000] rotate-45" : "bg-white/5"}`}>
          <Plus className={`w-5 h-5 transition-colors ${isOpen ? "text-white" : "text-[#96979c]"}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
          >
            <div className="px-8 pb-8 pt-0 text-[#96979c] text-sm md:text-base leading-relaxed font-light border-t border-white/5 mt-2 pt-6 second">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
