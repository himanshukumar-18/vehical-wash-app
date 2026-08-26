"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Droplet {
    id: number;
    x: number;
    y: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPRING_CONFIG = { stiffness: 800, damping: 35, mass: 0.25 };
const SCALE_SPRING = { type: "spring" as const, stiffness: 500, damping: 30 };
const DOT_SPRING = { type: "spring" as const, stiffness: 500, damping: 25 };

// Selectors that expand the cursor ring on hover
const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, [data-cursor]";

// Max droplets kept in state at once (older ones are trimmed)
const MAX_DROPLETS = 4;

// Droplet lifetime in ms
const DROPLET_TTL = 650;

// ---------------------------------------------------------------------------
// PremiumCursor — only renders on pointer: fine devices (mouse / trackpad)
// ---------------------------------------------------------------------------

export default function PremiumCursor() {
    const [enabled, setEnabled] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [droplets, setDroplets] = useState<Droplet[]>([]);
    const [ripple, setRipple] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, SPRING_CONFIG);
    const springY = useSpring(cursorY, SPRING_CONFIG);

    // -------------------------------------------------------------------------
    // Enable only on real pointer devices — disable on touch screens
    // -------------------------------------------------------------------------

    useEffect(() => {
        const mq = window.matchMedia("(pointer: fine)");
        const update = () => setEnabled(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    // -------------------------------------------------------------------------
    // Mouse move + click listeners
    // -------------------------------------------------------------------------

    useEffect(() => {
        if (!enabled) return;

        const onMove = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setIsHovering(Boolean((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)));
        };

        const onClick = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);

            // Ripple effect
            setRipple(true);
            setTimeout(() => setRipple(false), 450);

            // Spawn a droplet and auto-remove it after TTL
            const id = Date.now();
            setDroplets(prev => [...prev.slice(-(MAX_DROPLETS - 1)), { id, x: e.clientX, y: e.clientY }]);
            setTimeout(() => setDroplets(prev => prev.filter(d => d.id !== id)), DROPLET_TTL);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("click", onClick);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("click", onClick);
        };
    }, [enabled, cursorX, cursorY]);

    // -------------------------------------------------------------------------
    // Don't render anything on touch devices
    // -------------------------------------------------------------------------

    if (!enabled) return null;

    return (
        <>
            {/* Hide native cursor on pointer-fine devices */}
            <style jsx global>{`
        @media (pointer: fine) {
          body, a, button, input, textarea, select {
            cursor: none !important;
          }
        }
      `}</style>

            {/* ================================================================
          MAIN CURSOR
      ================================================================ */}
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[9999]"
                style={{ x: springX, y: springY }}
            >
                {/* Outer ring — expands on interactive element hover */}
                <motion.div
                    animate={{
                        width: isHovering ? 44 : 28,
                        height: isHovering ? 44 : 28,
                        x: isHovering ? -22 : -14,
                        y: isHovering ? -22 : -14,
                        borderColor: isHovering
                            ? "rgba(25,199,243,0.65)"
                            : "rgba(25,199,243,0.35)",
                    }}
                    transition={SCALE_SPRING}
                    className="absolute rounded-full border"
                />

                {/* Center dot */}
                <motion.div
                    animate={{
                        width: isHovering ? 7 : 5,
                        height: isHovering ? 7 : 5,
                        x: isHovering ? -3.5 : -2.5,
                        y: isHovering ? -3.5 : -2.5,
                    }}
                    transition={DOT_SPRING}
                    className="absolute rounded-full bg-[var(--color-primary)] shadow-[0_0_12px_rgba(25,199,243,0.8)]"
                />

                {/* Specular highlight */}
                <span className="absolute -left-px -top-px h-0.5 w-0.5 rounded-full bg-white" />
            </motion.div>

            {/* ================================================================
          CLICK RIPPLE
      ================================================================ */}
            <AnimatePresence>
                {ripple && (
                    <motion.div
                        initial={{ opacity: 0.7, scale: 0.3 }}
                        animate={{ opacity: 0, scale: 2.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="pointer-events-none fixed z-[9998] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-primary)]/70"
                        style={{ left: cursorX, top: cursorY }}
                    />
                )}
            </AnimatePresence>

            {/* ================================================================
          WATER DROPLETS
      ================================================================ */}
            <AnimatePresence>
                {droplets.map(({ id, x, y }) => (
                    <motion.span
                        key={id}
                        initial={{ opacity: 0.8, scale: 0.5, x, y }}
                        animate={{ opacity: 0, scale: 1, x: x + 12, y: y - 18 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="pointer-events-none fixed z-[9997] h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(25,199,243,0.6)]"
                    />
                ))}
            </AnimatePresence>
        </>
    );
}