import React, { useState } from "react";
import logo from "../assets/img/RF.png";
import contact from "../assets/img/contact.avif";
import ContactForm from "./contact-form";
import { motion } from "framer-motion";

function Contact() {
  return (
    <section id="contact" className="py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-start"
          >
            <img src={(logo as any)?.src || logo} alt="RAHULFITZZ Logo" className="h-16 md:h-20 mb-8 object-contain" />
            <h1 className="md:text-6xl text-4xl font-black text-white uppercase tracking-tighter leading-none mb-6">
              LET’S BUILD <br /> <span className="text-[#eb0000]">THE FUTURE.</span>
            </h1>

            <p className="text-xl text-[#96979c] font-light leading-relaxed max-w-lg mb-8 border-l-2 border-[#eb0000]/50 pl-6">
              Experience the power of a combined 145K+ reach. Whether it’s high-production content or a global brand partnership, let’s engineer an impact that lasts.
            </p>

            <div className="flex items-center gap-4 text-white/50 text-xs tracking-widest uppercase font-bold">
              <span className="w-8 h-[1px] bg-white/20"></span>
              Join the elite family
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl"
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>

      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <img src={(contact as any)?.src || contact} alt="" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#050505] to-transparent" />
      </div>
    </section>
  );
}

export default Contact;
