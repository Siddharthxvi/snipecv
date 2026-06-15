"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function TweakButton() {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    window.dispatchEvent(new Event("snipecv-tweak"));
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 1.2, ease: "linear" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        backgroundColor: hovered ? "#7B4F79" : "#6B3F69",
        color: "#FFF0DD",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: hovered ? "0.02em" : "-0.02em",
        fontSize: "clamp(1.2rem, 1.8vw, 1.8rem)",
        lineHeight: 1,
        padding: "0.75rem 0",
        width: "100%",
        border: "none",
        borderRadius: 0,
        boxShadow: "none",
        cursor: "pointer",
        outline: "none",
        transition: "letter-spacing 300ms linear, background-color 300ms linear",
      }}
    >
      TWEAK MY
    </motion.button>
  );
}


