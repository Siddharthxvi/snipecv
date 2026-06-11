"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AsciiMorph from "@/components/Landing/AsciiMorph";
import DistortionText from "@/components/Landing/DistortionText";
import Navigation from "@/components/Landing/Navigation";
import RotatingLinks from "@/components/Landing/RotatingLinks";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main className="w-screen h-screen bg-[#FFF0DD] flex items-center justify-center font-sans">
        <div className="text-[#842A3B] text-xs uppercase tracking-widest font-mono animate-pulse">
          Initializing Terminal...
        </div>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#FFF0DD] text-[#842A3B] flex flex-col justify-between p-6 md:p-12 relative selection:bg-[#6B3F69] selection:text-[#FFF0DD]">
      {/* Top Section */}
      <div className="w-full flex justify-end items-start z-10">
        {/* Rotating Links (Sequence Step 4) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 2.2, ease: "easeOut" }}
        >
          <RotatingLinks />
        </motion.div>
      </div>

      {/* Main Body Layout */}
      <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24 max-w-7xl mx-auto z-10">
        
        {/* LEFT COLUMN: ASCII Morph Artwork (Sequence Step 1) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="w-full md:w-1/2 flex justify-center md:justify-end items-center"
        >
          <AsciiMorph />
        </motion.div>

        {/* RIGHT COLUMN: Branding + Navigation (Sequence Steps 2 & 3) */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center">
          {/* SNIPECV Text Title (Sequence Step 2) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.0, ease: "easeOut" }}
            className="w-full flex justify-center md:justify-start"
          >
            <DistortionText />
          </motion.div>

          {/* Navigation ABOUT / LOGIN (Sequence Step 3) */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 1.6, ease: "easeOut" }}
            className="w-full flex justify-center md:justify-start"
          >
            <Navigation />
          </motion.div>
        </div>

      </div>

      {/* Subtle Grain Overlay for Paper Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle,#000_1px,transparent_1px)] bg-[size:12px_12px] mix-blend-multiply" />
    </main>
  );
}
