"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward } from "lucide-react";
import CarScene from "./CarScene";
import WaterEffect from "./WaterEffect";
import BrandReveal from "./BrandReveal";

interface BlackWashIntroProps {
  onComplete: () => void;
}

export default function BlackWashIntro({ onComplete }: BlackWashIntroProps) {
  const [scene, setScene] = useState<number>(1);
  const [cleanProgress, setCleanProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const handleFinish = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  }, [onComplete]);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setScene(4);
      setCleanProgress(1);
      const timer = setTimeout(() => {
        handleFinish();
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Timeline Scene Controller (Total ~5.2 seconds)
    // 0.0s - 0.8s: Scene 1 - Dark Silhouette
    // 0.8s - 2.4s: Scene 2 - Water Pressure Sweep (cleanProgress 0 -> 1)
    // 2.4s - 3.6s: Scene 3 - Deep Clean & Metallic Gloss Sweep
    // 3.6s - 4.8s: Scene 4 - Brand Reveal
    // 4.8s - 5.4s: Scene 5 - Smooth Zoom & Exit

    const startTime = Date.now();
    const duration = 5200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= 800 && elapsed < 2400) {
        setScene(2);
        const progress = (elapsed - 800) / 1600;
        setCleanProgress(Math.min(1, Math.max(0, progress)));
      } else if (elapsed >= 2400 && elapsed < 3600) {
        setScene(3);
        setCleanProgress(1);
      } else if (elapsed >= 3600 && elapsed < 4800) {
        setScene(4);
      } else if (elapsed >= 4800 && elapsed < duration) {
        setScene(5);
      } else if (elapsed >= duration) {
        clearInterval(interval);
        handleFinish();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [handleFinish]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="blackwash-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex h-screen w-screen flex-col justify-between overflow-hidden bg-[#050708] select-none"
        >
          {/* Subtle Ambient Particles Layer */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0D1115] via-[#050708] to-[#000000] opacity-90" />

          {/* Top Bar / Skip Button */}
          <div className="relative z-40 flex items-center justify-between p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#19C7F3] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#707A82]">
                Intro Experience
              </span>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="group inline-flex items-center gap-2 border border-[#26313A] bg-[#0D1115]/80 px-4 py-2 text-xs font-bold text-[#A7B0B7] backdrop-blur-md transition-all hover:border-[#19C7F3] hover:text-[#19C7F3]"
            >
              Skip <SkipForward size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Main Stage (Car Scene & High Pressure Water) */}
          <div className="relative flex flex-1 items-center justify-center">
            <CarScene scene={scene} cleanProgress={cleanProgress} />
            <WaterEffect active={scene === 2} cleanProgress={cleanProgress} />
            <BrandReveal visible={scene >= 4} />
          </div>

          {/* Bottom Audio/Progress Indicator Bar */}
          <div className="relative z-40 flex items-center justify-between px-6 pb-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#707A82] sm:px-8 sm:pb-8">
            <span>The Black Wash</span>

            {/* Progress Segment Dots */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <span
                  key={s}
                  className={`h-1.5 transition-all duration-300 ${
                    scene >= s ? "w-6 bg-[#19C7F3]" : "w-1.5 bg-[#26313A]"
                  }`}
                />
              ))}
            </div>

            <span>Doorstep Wash</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
