"use client";

import { motion } from "framer-motion";

export default function SidebarTrigger() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "linear" }}
      style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "6px" }}
    >
      <div
        style={{
          width: "28px",
          height: "4px",
          backgroundColor: "#662222",
        }}
      />
      <div
        style={{
          width: "28px",
          height: "4px",
          backgroundColor: "#662222",
        }}
      />
    </motion.div>
  );
}
