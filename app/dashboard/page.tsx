"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SidebarTrigger from "@/components/Dashboard/SidebarTrigger";
import CareerReceipt from "@/components/Dashboard/CareerReceipt";
import JobInputPanel from "@/components/Dashboard/JobInputPanel";
import TweakButton from "@/components/Dashboard/TweakButton";
import CareerSequenceLogo from "@/components/Dashboard/CareerSequenceLogo";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="w-screen h-screen bg-[#FFF0DD] flex items-center justify-center">
        <div className="text-[#842A3B] text-xs uppercase tracking-widest font-mono animate-pulse">
          Loading Career Console...
        </div>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#FFF0DD] relative flex selection:bg-[#6B3F69] selection:text-[#FFF0DD]">
      {/* Hide scrollbars globally on this page */}
      <style>{`
        *::-webkit-scrollbar {
          display: none !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Paper grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle,#000_1px,transparent_1px)] bg-[size:12px_12px] mix-blend-multiply z-40" />

      {/* LEFT COLUMN: Sidebar trigger + Receipt (35% width) */}
      <div className="relative flex flex-col h-full" style={{ width: "35%" }}>
        {/* Sidebar trigger — absolute top-left */}
        <div className="absolute top-6 left-6 z-20">
          <SidebarTrigger />
        </div>

        {/* Receipt — shifted to the right, takes up to 75% height max */}
        <div className="flex-1 flex items-center justify-end overflow-y-auto pl-12 pr-8 py-8">
          <div className="w-full flex justify-end">
            <CareerReceipt />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Skill Cloud (Top) & Controls (Bottom) (65% width) */}
      <div className="flex flex-col h-full" style={{ width: "65%" }}>
        {/* Top Half: Skill Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "linear" }}
          style={{ height: "50%" }}
          className="relative w-full"
        >
          <CareerSequenceLogo />
        </motion.div>

        {/* Bottom Half: CV/Tweak button (Left 40%) + Job Input Panel (Right 60%) */}
        <div className="flex w-full" style={{ height: "50%" }}>
          {/* Bottom Left inside: CV Text & Tweak My Button */}
          <div
            className="flex flex-col items-center justify-center relative px-6"
            style={{ width: "40%" }}
          >
            {/* Wrap in fixed width container to align exactly */}
            <div style={{ width: "200px" }} className="flex flex-col items-center">
              {/* CV — large printed logo text matched to button width */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "linear" }}
                className="select-none w-full text-center overflow-visible"
              >
                <span
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontWeight: 900,
                    fontSize: "76px",
                    color: "#1a1a1a",
                    lineHeight: 1,
                    display: "inline-block",
                    transform: "scaleX(2.2)",
                    transformOrigin: "center",
                    letterSpacing: "-0.04em",
                  }}
                >
                  CV
                </span>
              </motion.div>

              {/* Tweak My button — below CV */}
              <div className="mt-8 w-full">
                <TweakButton />
              </div>
            </div>
          </div>

          {/* Bottom Right inside: Job Input Panel (made smaller with padding bounds) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: "linear" }}
            style={{ width: "60%" }}
            className="relative h-full flex items-center justify-center p-8"
          >
            <div className="w-[85%] h-[85%]">
              <JobInputPanel />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

