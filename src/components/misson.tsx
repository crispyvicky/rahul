import { motion } from "framer-motion";
import CounterNumber from "./counter";

export default function Misson() {
  return (
    <section id="mission" className="relative w-full bg-black py-32 overflow-hidden flex justify-center">

      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#eb0000] opacity-10 blur-[120px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="text-[#eb0000] text-sm md:text-base tracking-[0.4em] font-bold uppercase mb-4 block">
            The Philosophy
          </span>
          <h1
            className="text-white text-4xl md:text-[80px] leading-[1.1] font-black uppercase tracking-tighter mb-8"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            YOUR TRANSFORMATION.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              MY BLUEPRINT.
            </span>
          </h1>

          <p className="text-[#96979c] text-lg md:text-2xl leading-relaxed font-light mb-16">
            I haven't just trained to build a great physique—I've engineered the perfect protocol so you can too. My mission is to tear down the confusion around fitness and give you the raw, unfiltered tools required to unlock your absolute highest potential.
          </p>
        </motion.div>

        {/* Premium Stats Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Stat 1 */}
          <div className="text-center border-b md:border-b-0 md:border-r border-white/10 p-10 md:p-14 hover:bg-white/5 transition-colors duration-500">
            <h2 className="text-[60px] md:text-[80px] leading-none mb-4 text-white font-black" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              <CounterNumber value={100} />
              <span className="text-[#eb0000]">K+</span>
            </h2>
            <p className="text-sm tracking-[0.2em] text-[#96979c] uppercase font-bold">
              Active Members
            </p>
          </div>

          {/* Stat 2 */}
          <div className="text-center border-b md:border-b-0 md:border-r border-white/10 p-10 md:p-14 hover:bg-white/5 transition-colors duration-500">
            <h2 className="text-[60px] md:text-[80px] leading-none mb-4 text-white font-black" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              <CounterNumber value={10} />
              <span className="text-[#eb0000]">M+</span>
            </h2>
            <p className="text-sm tracking-[0.2em] text-[#96979c] uppercase font-bold">
              Workouts Logged
            </p>
          </div>

          {/* Stat 3 */}
          <div className="text-center p-10 md:p-14 hover:bg-white/5 transition-colors duration-500">
            <h2 className="text-[60px] md:text-[80px] leading-none mb-4 text-white font-black" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              <CounterNumber value={99} />
              <span className="text-[#eb0000]">%</span>
            </h2>
            <p className="text-sm tracking-[0.2em] text-[#96979c] uppercase font-bold">
              Success Rate
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
