"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Cursor() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center translate-x-[-50%] translate-y-[-50%]"
            animate={{ x: mousePos.x, y: mousePos.y }}
            transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.5 }}
        >
            {/* Sharper, Smaller Gym Barbell Cursor */}
            <div className="relative flex items-center">
                <div className="w-1.5 h-3 bg-white rounded-sm" />
                <div className="w-0.5 h-2 bg-white mx-[0.5px] rounded-sm" />
                <div className="w-6 h-[1.5px] bg-white" />
                <div className="w-0.5 h-2 bg-white mx-[0.5px] rounded-sm" />
                <div className="w-1.5 h-3 bg-white rounded-sm" />
            </div>
        </motion.div>
    );
}
