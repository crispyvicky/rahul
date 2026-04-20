import React from "react";
import { Target, Zap, Shield, ChevronRight } from "lucide-react";
import { delay, motion } from "framer-motion";

function Workout_Plan() {
  const pillars = [
    {
      icon: <Target className="w-10 h-10 text-white" />,
      title: "Precision Hypertrophy",
      desc: "Scientifically backed volume targets for maximum muscle growth."
    },
    {
      icon: <Zap className="w-10 h-10 text-white" />,
      title: "Neuromuscular Power",
      desc: "Explosive movement protocols to unlock your true athletic potential."
    },
    {
      icon: <Shield className="w-10 h-10 text-white" />,
      title: "Bulletproof Mobility",
      desc: "Integrated recovery and joint health for long-term iron longevity."
    },
  ];

  return (
    <div className="bg-[#050505] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#eb0000]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="md:pt-48 pt-32 pb-20 px-6 container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-[#eb0000] text-sm tracking-[0.5em] font-bold uppercase mb-4 block">Engineered for Elite Performance</span>
            <h1
              className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter"
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              THE <span className="text-[#eb0000]">BLUEPRINT</span> <br /> METHODOLOGY
            </h1>
            <p className="text-[#96979c] text-lg md:text-xl leading-relaxed font-light max-w-3xl mx-auto border-l-2 border-[#eb0000]/30 pl-8 text-left italic">
              "True transformation isn't found in a generic routine. It's built through calculated intensity, unwavering discipline, and a methodology that refuses to compromise."
            </p>
          </motion.div>

          <div className="mt-24 space-y-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {pillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-[#eb0000]/30 transition-all duration-500 group"
                >
                  <div className="flex flex-col items-start text-left space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#eb0000] flex items-center justify-center shadow-[0_0_20px_rgba(235,0,0,0.3)] transition-transform duration-500 group-hover:scale-110">
                      {pillar.icon}
                    </div>
                    <div>
                      <h3 className="text-xl text-white font-black uppercase tracking-tight mb-3" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                        {pillar.title}
                      </h3>
                      <p className="text-[#96979c] text-sm leading-relaxed font-light">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Workout_Plan;
