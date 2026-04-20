import { useEffect, useRef } from "react";
import { TestimonialCard } from "./TestimonialCard";
import { testimonialData as data } from "../rawData.js";
import Splide from "@splidejs/splide";
import "@splidejs/splide/dist/css/splide.min.css";
import { motion } from "framer-motion";

const What_People_Say = () => {
  const splideRef = useRef(null);

  useEffect(() => {
    if (!splideRef.current) return;

    const splide = new Splide(splideRef.current, {
      type: "loop",
      drag: "free",
      focus: "center",
      perPage: 3,
      gap: "2rem",
      arrows: false,
      pagination: false,
      autoplay: true,
      interval: 0,
      speed: 15000,
      rewind: true,
      pauseOnHover: false,
      breakpoints: {
        1024: { perPage: 2 },
        640: { perPage: 1 },
      },
    });

    splide.mount();
    return () => {
      splide.destroy();
    };
  }, []);

  return (
    <section
      id="testimonials"
      className="py-32 bg-[#050505] relative overflow-hidden border-y border-white/5"
    >
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#eb0000]/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#eb0000]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[#eb0000] text-sm tracking-[0.4em] font-bold uppercase mb-4 block">Real Transformations</span>
          <h2
            className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            THE <span className="text-[#eb0000]">EVOLUTION</span> FEED
          </h2>
        </motion.div>

        <div className="splide" ref={splideRef}>
          <div className="splide__track !overflow-visible">
            <div className="splide__list">
              {data.map((item, i) => (
                <div className="splide__slide" key={i}>
                  <TestimonialCard
                    name={item.name}
                    role={item.role}
                    rating={item.rating}
                    comment={item.comment}
                    imageUrl={item.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default What_People_Say;
