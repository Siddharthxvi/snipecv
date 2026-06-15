"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MemoryTiles from "@/components/Auth/MemoryTiles";
import AuthForm from "@/components/Auth/AuthForm";

export default function AuthPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="w-screen h-screen bg-[#FFF0DD] flex items-center justify-center font-sans">
        <div className="text-[#842A3B] text-xs uppercase tracking-widest font-mono animate-pulse">
          Initializing Authentication Channel...
        </div>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#FFF0DD] text-[#842A3B] flex flex-col md:flex-row p-6 md:p-12 relative selection:bg-[#6B3F69] selection:text-[#FFF0DD]">
      {/* Top Header branding (Return home interaction) */}
      <div className="absolute left-6 md:left-12 top-6 md:top-12 z-20">
        <a 
          href="/" 
          className="group text-[10px] font-sans font-bold tracking-widest uppercase text-[#842A3B] transition-[letter-spacing,color] duration-500 hover:text-[#6B3F69] hover:tracking-[0.3em]"
        >
          {"SNIPECV \\\\  HOME"}
        </a>
      </div>

      {/* Left Column: Memory Sliding Tiles */}
      <section className="flex-1 w-full h-1/2 md:h-full flex items-center justify-center border-b md:border-b-0 md:border-r border-[#842A3B]/10 p-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="flex items-center justify-center w-full h-full"
        >
          <MemoryTiles />
        </motion.div>
      </section>

      {/* Right Column: Authentication Form */}
      <section className="flex-1 w-full h-1/2 md:h-full flex items-center justify-center p-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.8, ease: "easeOut" }}
          className="flex items-center justify-center w-full h-full"
        >
          <AuthForm />
        </motion.div>
      </section>

      {/* Subtle Grain Overlay for Paper Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle,#000_1px,transparent_1px)] bg-[size:12px_12px] mix-blend-multiply z-30" />
    </main>
  );
}
