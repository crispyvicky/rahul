"use client";

import { useEffect, useRef } from "react";
import { TestimonialCard } from "./TestimonialCard";
import { testimonialData as data } from "../rawData.js";
import Splide from "@splidejs/splide";
import { AutoScroll } from "@splidejs/splide-extension-auto-scroll";
import "@splidejs/splide/dist/css/splide.min.css";
import { motion } from "framer-motion";

/** Triple clone for seamless infinite loop on mobile */
const FEED_SLIDES = [...data, ...data, ...data];

const What_People_Say = () => {
  const splideRef = useRef<HTMLDivElement>(null);
  const splideInstance = useRef<Splide | null>(null);

  useEffect(() => {
    const root = splideRef.current;
    if (!root) return;

    if (splideInstance.current) {
      splideInstance.current.destroy(true);
      splideInstance.current = null;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const splide = new Splide(root, {
      type: "loop",
      drag: prefersReducedMotion ? false : "free",
      snap: false,
      focus: "center",
      perPage: 3,
      perMove: 1,
      gap: "1.5rem",
      arrows: false,
      pagination: false,
      autoWidth: false,
      trimSpace: false,
      breakpoints: {
        1024: {
          perPage: 2,
          gap: "1rem",
        },
        640: {
          perPage: 1,
          gap: "1rem",
          padding: { left: "1.25rem", right: "1.25rem" },
        },
      },
      autoScroll: prefersReducedMotion
        ? false
        : {
            speed: 0.55,
            pauseOnHover: true,
            pauseOnFocus: false,
            autoStart: true,
            rewind: true,
          },
    });

    splide.mount({ AutoScroll });
    splideInstance.current = splide;

    const onResize = () => {
      splide.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      splide.destroy(true);
      splideInstance.current = null;
    };
  }, []);

  return (
    <section
      id="testimonials"
      className="evolution-feed py-24 sm:py-32 bg-[#050505] relative overflow-hidden border-y border-white/5"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#eb0000]/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#eb0000]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="text-[#eb0000] text-sm tracking-[0.4em] font-bold uppercase mb-4 block">
            Real Transformations
          </span>
          <h2
            className="text-white text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            THE <span className="text-[#eb0000]">EVOLUTION</span> FEED
          </h2>
        </motion.div>

        <div className="splide evolution-feed__slider" ref={splideRef}>
          <div className="splide__track evolution-feed__track">
            <div className="splide__list evolution-feed__list">
              {FEED_SLIDES.map((item, i) => (
                <div className="splide__slide evolution-feed__slide" key={`${item.name}-${i}`}>
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
