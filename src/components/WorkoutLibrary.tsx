"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const workouts = [
    {
        title: "Morning Mobility",
        category: "MOBILITY",
        image: "https://darebee.com/images/workouts/morning-mobility-workout.jpg"
    },
    {
        title: "Core Control",
        category: "CORE",
        image: "https://darebee.com/images/workouts/abs-of-steel-workout.jpg"
    },
    {
        title: "Power Burn",
        category: "CARDIO",
        image: "https://darebee.com/images/workouts/power-burn-workout.jpg"
    },
    {
        title: "Yoga Flow",
        category: "FLEXIBILITY",
        image: "https://darebee.com/images/workouts/yoga-flow-workout.jpg"
    },
    // {
    //     title: "Assassin's Edge",
    //     category: "AGILITY",
    //     image: null // Removed as requested
    // },
    {
        title: "Brawler",
        category: "STRENGTH",
        image: "https://darebee.com/images/workouts/brawler-workout.jpg"
    },
    {
        title: "Gravity",
        category: "BODYWEIGHT",
        image: "https://darebee.com/images/workouts/gravity-workout.jpg"
    },
    {
        title: "Fighter",
        category: "STRENGTH",
        image: "https://darebee.com/images/workouts/fighter-workout.jpg"
    },
    {
        title: "Gladiator",
        category: "FULL BODY",
        image: "https://darebee.com/images/workouts/gladiator-workout.jpg"
    }
];

// Double the items for seamless looping
const marqueeWorkouts = [...workouts, ...workouts, ...workouts];

export default function WorkoutLibrary() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    return (
        <section className="py-32 bg-[#050505] overflow-hidden w-full relative border-y border-white/5">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#eb0000]/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#eb0000]/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mb-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-[#eb0000] text-sm tracking-[0.5em] font-bold uppercase mb-4 block">
                        The Blueprint Vault
                    </span>
                    <h2
                        className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter"
                        style={{ fontFamily: '"Orbitron", sans-serif' }}
                    >
                        ROUTINE <span className="text-[#eb0000]">DATABASE</span>
                    </h2>
                </motion.div>
            </div>

            {/* Infinite Marquee Container */}
            <div
                className="relative flex overflow-hidden group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <motion.div
                    animate={{ x: isPaused ? 0 : [0, -2500] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40,
                            ease: "linear",
                        },
                    }}
                    className="flex gap-8 px-4 py-10"
                >
                    {marqueeWorkouts.map((workout, index) => (
                        <div
                            key={`${workout.title}-${index}`}
                            className="flex-shrink-0 w-[300px] md:w-[450px] group/card cursor-pointer"
                            onClick={() => workout.image && setSelectedImage(workout.image)}
                        >
                            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/5 transition-all duration-700 hover:border-[#eb0000]/50 shadow-2xl bg-[#0a0a0a]">
                                {workout.image ? (
                                    <img
                                        src={workout.image}
                                        alt={workout.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover object-top opacity-60 group-hover/card:opacity-100 transition-all duration-700 group-hover/card:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#111] flex items-center justify-center border border-white/5">
                                        <div className="text-[#eb0000]/5 text-9xl font-black">{workout.category[0]}</div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                                <div className="absolute bottom-10 left-10 right-10">
                                    <span className="text-[#eb0000] text-[10px] tracking-[0.4em] font-black uppercase mb-2 block">{workout.category}</span>
                                    <h3 className="text-white text-2xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                                        {workout.title}
                                    </h3>
                                </div>

                                {/* Branded Element */}
                                <div className="absolute top-10 left-10 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                                    <div className="w-2 h-2 rounded-full bg-[#eb0000] animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Fade Overlays */}
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />
            </div>

            <div className="mt-12 text-center text-white/20 uppercase tracking-[0.4em] font-black text-xs select-none">
                [ Marquee paused on focus for detailed examination ]
            </div>

            {/* Expanded Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 md:p-8 cursor-pointer backdrop-blur-3xl"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative max-w-5xl w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage}
                                alt="Expanded Routine"
                                className="max-w-full max-h-[90vh] rounded-3xl shadow-[0_0_100px_rgba(235,0,0,0.2)] object-contain border border-white/10"
                            />
                            <button
                                className="absolute top-8 right-8 text-white/50 hover:text-[#eb0000] font-black tracking-[0.5em] transition-all uppercase text-[10px] p-4 bg-white/5 rounded-full border border-white/10 hover:border-[#eb0000]"
                                onClick={() => setSelectedImage(null)}
                            >
                                CLOSE
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
