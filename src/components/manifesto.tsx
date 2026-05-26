"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import bannerImg from "../assets/img/bike.jpg";

const lineVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
        },
    }),
};

export default function Manifesto() {
    return (
        <section id="about" className="relative bg-[#050505] w-full py-12 sm:py-20 md:py-40 lg:py-52 overflow-x-hidden border-b border-white/5 scroll-mt-24">
            {/* Ambient Background Detail */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(235,0,0,0.03)_0%,_transparent_50%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">

                    {/* Left Column: Heading & Visual */}
                    <div className="lg:col-span-5">
                        <motion.div
                            variants={lineVariant}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0}
                        >
                            <span className="text-[#eb0000] text-xs tracking-[0.6em] font-bold uppercase mb-6 block">
                                The Identity
                            </span>
                            <h1 className="text-white text-[clamp(2.5rem,12vw,4.5rem)] md:text-9xl font-black font-heading uppercase tracking-tighter leading-[0.85] mb-8 md:mb-12">
                                I'M <br />
                                <span className="text-[#eb0000]">RAHUL.</span>
                            </h1>

                            {/* Added Visual as requested */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="relative mt-8 md:mt-12 aspect-[4/5] max-h-[min(72vw,320px)] sm:max-h-[380px] md:max-h-none md:aspect-[4/5] w-full mx-auto rounded-none overflow-hidden border border-white/10 group shadow-2xl"
                            >
                                <Image
                                    src={bannerImg}
                                    alt="Rahul Performance"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                    quality={70}
                                    className="object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-10 left-10 text-white/50 text-[10px] tracking-[0.5em] font-bold uppercase">
                                    EST. 2024 / PERFORMANCE
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-7 flex flex-col gap-8 md:gap-12 lg:mt-24">
                        <motion.div
                            custom={1} variants={lineVariant} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="max-w-xl"
                        >
                            <h3 className="text-white text-[clamp(1.35rem,5.5vw,2rem)] md:text-5xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.15] break-words">
                                THIS IS MORE THAN FITNESS — <br />
                                <span className="text-[#eb0000] italic">IT'S DISCIPLINE.</span>
                            </h3>
                            <p className="text-[#96979c] text-lg md:text-xl font-light leading-relaxed border-l border-[#eb0000] pl-8">
                                Every day, I’m building strength, consistency, and a mindset most people avoid. This isn’t just training; it's the architecture of an elite life.
                            </p>
                        </motion.div>

                        <motion.div
                            custom={2} variants={lineVariant} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="relative group py-4"
                        >
                            <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-[#eb0000] to-transparent" />
                            <div className="pl-10">
                                <p className="text-white text-2xl md:text-4xl font-black uppercase tracking-tight mb-3">
                                    The Brand. The Community.
                                </p>
                                <p className="text-[#eb0000] text-xl font-bold uppercase tracking-[0.4em] inline-flex items-center gap-4">
                                    Something bigger.
                                    <span className="w-12 h-[1px] bg-[#eb0000]" />
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            custom={3} variants={lineVariant} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="mt-2 md:mt-8"
                        >
                            <h4 className="text-white text-[clamp(1.75rem,8vw,2.75rem)] md:text-7xl font-black font-heading uppercase tracking-tighter leading-[1.05] break-words">
                                THIS IS JUST <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-800">
                                    THE BEGINNING.
                                </span>
                            </h4>
                        </motion.div>
                    </div>

                </div>

            </div>
        </section>
    );
}
