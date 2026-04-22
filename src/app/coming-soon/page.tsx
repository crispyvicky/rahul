"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Timer, Bell, X, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ComingSoon() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        try {
            const res = await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (error) {
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden px-6">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#eb0000]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#eb0000]/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Grain Overlay */}
            <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 text-center max-w-3xl"
            >
                <div className="flex justify-center mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                        <Timer className="text-[#eb0000] w-8 h-8" />
                    </div>
                </div>

                <span className="text-[#eb0000] text-sm md:text-base tracking-[0.8em] font-black uppercase mb-6 block">
                    Protocol Initialization
                </span>

                <h1
                    className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                    COMING <span className="text-[#eb0000]">SOON</span>
                </h1>

                <p className="text-[#96979c] text-lg md:text-xl font-light leading-relaxed mb-12 max-w-2xl mx-auto">
                    We are currently calibrating the elite training protocols to ensure absolute performance peaks. The evolution is being engineered.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs transition-transform hover:scale-105"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Base
                    </Link>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group flex items-center gap-3 px-8 py-4 border border-white/10 bg-white/5 backdrop-blur-xl text-white font-black uppercase tracking-widest text-xs hover:bg-[#eb0000] hover:border-[#eb0000] transition-all"
                    >
                        <Bell className="w-4 h-4" />
                        Notify On Launch
                    </button>
                </div>
            </motion.div>

            {/* Cinematic Footer Text */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
                <span className="text-[10px] tracking-[1em] uppercase font-black">RahulFitzz Elite Systems v1.0.4</span>
            </div>

            {/* Waitlist Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 md:p-10 relative overflow-hidden"
                        >
                            {/* Accent Bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#eb0000]" />

                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setTimeout(() => setStatus("idle"), 500);
                                }}
                                className="absolute top-6 right-6 text-[#96979c] hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-8"
                                >
                                    <CheckCircle2 className="w-16 h-16 text-[#eb0000] mx-auto mb-6" />
                                    <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Status Confirmed</h3>
                                    <p className="text-[#96979c] text-sm leading-relaxed">
                                        Your position on the waitlist has been secured. We will initiate contact when the protocols are active.
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Secure Access</h2>
                                        <p className="text-[#96979c] text-sm">Enter your credentials to join the elite launch sequence.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-[#96979c] uppercase tracking-[0.2em] font-bold">Ident</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="YOUR NAME"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-[#111111] border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#eb0000] transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-[#96979c] uppercase tracking-[0.2em] font-bold">Comms</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="YOUR EMAIL"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-[#111111] border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#eb0000] transition-colors"
                                            />
                                        </div>

                                        {status === "error" && (
                                            <p className="text-[#eb0000] text-xs uppercase tracking-widest mt-2 font-bold">System Error. Try Again.</p>
                                        )}

                                        <button
                                            disabled={status === "submitting"}
                                            type="submit"
                                            className="w-full mt-6 bg-white text-black font-black text-xs uppercase tracking-[0.3em] py-4 hover:bg-[#eb0000] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {status === "submitting" ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Transmitting...</>
                                            ) : (
                                                "Request Access"
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
