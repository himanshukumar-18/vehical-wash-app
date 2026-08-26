"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";

interface BrandRevealProps {
  visible: boolean;
}

export default function BrandReveal({ visible }: BrandRevealProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Brand Badge Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="mb-4 inline-flex items-center gap-2 border border-[#19C7F3]/30 bg-[#087EA4]/10 px-4 py-1.5 backdrop-blur-md"
      >
        <Sparkles size={14} className="text-[#19C7F3]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#19C7F3]">
          Mobile Doorstep Detailing
        </span>
      </motion.div>

      {/* Main Brand Title */}
      <motion.h1
        initial={{ letterSpacing: "0.15em", filter: "blur(12px)" }}
        animate={{ letterSpacing: "0.22em", filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl font-extrabold uppercase text-[#F5F7F8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        THE BLACK <span className="text-[#19C7F3]">WASH</span>
      </motion.h1>

      {/* Cyan Light Sheen Divider */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "160px", opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="my-5 h-[2px] bg-gradient-to-r from-transparent via-[#19C7F3] to-transparent shadow-[0_0_12px_#19C7F3]"
      />

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="max-w-[480px] text-xs font-semibold uppercase tracking-[0.28em] text-[#A7B0B7] sm:text-sm"
      >
        Premium Car Care. At Your Doorstep.
      </motion.p>
    </motion.div>
  );
}
