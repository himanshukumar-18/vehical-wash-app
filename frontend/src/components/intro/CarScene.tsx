"use client";

import React from "react";
import { motion } from "framer-motion";

interface CarSceneProps {
  scene: number; // 1: Ambient Silhouette, 2: Water Blast, 3: Deep Clean, 4: Brand Reveal, 5: Exit
  cleanProgress: number; // 0 to 1
}

export default function CarScene({ scene, cleanProgress }: CarSceneProps) {
  const headlightsOn = scene >= 2;
  const showShine = scene >= 3;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Background Radial Glow */}
      <div
        className="pointer-events-none absolute h-[400px] w-[600px] rounded-full transition-opacity duration-1000 sm:h-[500px] sm:w-[800px]"
        style={{
          background: "radial-gradient(circle, rgba(25, 199, 243, 0.12) 0%, rgba(8, 126, 164, 0.04) 45%, transparent 70%)",
          opacity: scene >= 2 ? 1 : 0.3,
        }}
      />

      {/* Main Luxury Car Composition Container */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{
          scale: scene === 5 ? 1.2 : 1,
          opacity: scene === 5 ? 0 : 1,
        }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex w-full max-w-[900px] items-center justify-center px-4 sm:px-8"
      >
        {/* Luxury Sports Sedan Vector SVG */}
        <svg
          viewBox="0 0 1000 400"
          className="h-auto w-full filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Dark Metallic Paint Gradient */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1C242C" />
              <stop offset="40%" stopColor="#0D1115" />
              <stop offset="80%" stopColor="#080A0C" />
              <stop offset="100%" stopColor="#050708" />
            </linearGradient>

            {/* Glossy High-Contrast Paint Gradient */}
            <linearGradient id="glossBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D3A46" />
              <stop offset="25%" stopColor="#19C7F3" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#0D1115" />
              <stop offset="85%" stopColor="#080A0C" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>

            {/* Glass Windshield Gradient */}
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#19C7F3" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#087EA4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#050708" stopOpacity="0.8" />
            </linearGradient>

            {/* Chrome Accent Gradient */}
            <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#707A82" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#707A82" />
            </linearGradient>

            {/* Headlight Cyan Flare */}
            <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#19C7F3" stopOpacity="1" />
              <stop offset="40%" stopColor="#19C7F3" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#087EA4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#050708" stopOpacity="0" />
            </radialGradient>

            {/* Dirt Layer Pattern / Gradient */}
            <linearGradient id="dirtGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A3E31" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#382E24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2B221A" stopOpacity="0.8" />
            </linearGradient>

            {/* Metallic Shine Sweep Gradient */}
            <linearGradient id="shineSweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#19C7F3" stopOpacity="0" />
              <stop offset="45%" stopColor="#19C7F3" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="55%" stopColor="#19C7F3" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#19C7F3" stopOpacity="0" />
            </linearGradient>

            {/* Water Droplet Mask */}
            <pattern id="dropletsPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="12" r="1.5" fill="#19C7F3" opacity="0.6" />
              <circle cx="28" cy="24" r="2" fill="#FFFFFF" opacity="0.7" />
              <circle cx="35" cy="8" r="1" fill="#19C7F3" opacity="0.5" />
              <circle cx="18" cy="32" r="1.8" fill="#FFFFFF" opacity="0.8" />
            </pattern>
          </defs>

          {/* Under-Car Ground Shadow & Ambient Light */}
          <ellipse cx="500" cy="355" rx="420" ry="25" fill="#000000" opacity="0.85" />
          <ellipse cx="500" cy="350" rx="380" ry="12" fill="#19C7F3" opacity={scene >= 3 ? 0.18 : 0.05} />

          {/* BASE CAR SHADOW / SILHOUETTE OUTLINE */}
          <path
            d="M 120,330 C 130,290 170,270 230,260 C 300,250 360,180 440,150 C 530,120 670,125 760,165 C 830,195 870,240 890,285 C 900,310 890,335 870,340 L 130,340 Z"
            fill="#050708"
          />

          {/* CAR BODY - MAIN STRUCTURE */}
          <path
            d="M 110,320 
               C 120,290 150,265 210,250 
               C 270,235 340,175 425,145 
               C 515,115 675,120 765,160 
               C 835,190 875,235 895,275 
               C 905,295 895,325 870,330 
               L 130,330 
               Z"
            fill="url(#glossBodyGradient)"
            stroke="#26313A"
            strokeWidth="2"
          />

          {/* ROOF & WINDSHIELD GLASS */}
          <path
            d="M 350,225 
               C 410,165 485,135 635,138 
               C 725,140 765,175 790,215 
               C 720,220 540,222 350,225 Z"
            fill="url(#glassGradient)"
            stroke="#19C7F3"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />

          {/* SIDE WINDOW PILLARS */}
          <path d="M 500,140 L 515,224" stroke="#080A0C" strokeWidth="6" />
          <path d="M 640,142 L 665,220" stroke="#080A0C" strokeWidth="5" />

          {/* HOOD SCULPT LINES & FRONT BUMPER */}
          <path
            d="M 110,320 
               C 140,295 200,285 270,280 
               C 340,275 400,270 480,265"
            stroke="#19C7F3"
            strokeOpacity={showShine ? 0.6 : 0.2}
            strokeWidth="2"
            fill="none"
          />

          <path
            d="M 140,295 C 220,260 350,235 480,230"
            stroke="#3B4A54"
            strokeWidth="1.5"
            fill="none"
          />

          {/* REAR HAUNCH & SIDE BELTLINE */}
          <path
            d="M 480,230 C 650,225 780,228 895,275"
            stroke="#707A82"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />

          {/* FRONT & REAR WHEELS */}
          {/* Front Wheel */}
          <g transform="translate(230, 310)">
            <circle cx="0" cy="0" r="48" fill="#050708" stroke="#26313A" strokeWidth="4" />
            <circle cx="0" cy="0" r="36" fill="#12171C" stroke="url(#chromeGradient)" strokeWidth="3" />
            {/* Alloy Spokes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1="0"
                y1="0"
                x2={32 * Math.cos((angle * Math.PI) / 180)}
                y2={32 * Math.sin((angle * Math.PI) / 180)}
                stroke="#19C7F3"
                strokeOpacity="0.8"
                strokeWidth="2.5"
              />
            ))}
            <circle cx="0" cy="0" r="12" fill="#087EA4" />
          </g>

          {/* Rear Wheel */}
          <g transform="translate(770, 305)">
            <circle cx="0" cy="0" r="52" fill="#050708" stroke="#26313A" strokeWidth="4" />
            <circle cx="0" cy="0" r="39" fill="#12171C" stroke="url(#chromeGradient)" strokeWidth="3" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1="0"
                y1="0"
                x2={35 * Math.cos((angle * Math.PI) / 180)}
                y2={35 * Math.sin((angle * Math.PI) / 180)}
                stroke="#19C7F3"
                strokeOpacity="0.8"
                strokeWidth="2.5"
              />
            ))}
            <circle cx="0" cy="0" r="13" fill="#087EA4" />
          </g>

          {/* DIRT / DUST OVERLAY LAYER (Erased dynamically as cleanProgress increases) */}
          <g opacity={1 - cleanProgress} className="transition-opacity duration-300">
            <path
              d="M 110,320 
                 C 120,290 150,265 210,250 
                 C 270,235 340,175 425,145 
                 C 515,115 675,120 765,160 
                 C 835,190 875,235 895,275 
                 C 905,295 895,325 870,330 
                 L 130,330 Z"
              fill="url(#dirtGradient)"
            />
            {/* Mud/Dust Texture Spots */}
            <circle cx="280" cy="270" r="25" fill="#382E24" opacity="0.6" />
            <circle cx="410" cy="210" r="35" fill="#2B221A" opacity="0.7" />
            <circle cx="680" cy="200" r="40" fill="#382E24" opacity="0.6" />
            <path d="M 160,310 Q 300,280 450,290" stroke="#4A3E31" strokeWidth="12" opacity="0.7" fill="none" />
          </g>

          {/* WATER DROPLETS & SPECULAR GLOSS LAYER */}
          <g opacity={cleanProgress}>
            <path
              d="M 110,320 C 150,265 270,235 425,145 C 515,115 675,120 765,160 C 875,235 895,275 870,330 Z"
              fill="url(#dropletsPattern)"
            />
          </g>

          {/* LED HEADLIGHTS & LIGHT FLARES */}
          <g opacity={headlightsOn ? 1 : 0.2} className="transition-opacity duration-700">
            {/* Front Headlight Housing */}
            <path d="M 112,308 L 165,295 L 180,312 L 125,322 Z" fill="#19C7F3" opacity="0.9" />
            {/* Headlight Beam Light Projector */}
            <ellipse cx="120" cy="314" rx="8" ry="5" fill="#FFFFFF" />

            {headlightsOn && (
              <>
                {/* Cyan Forward Light Projection Beam */}
                <polygon points="120,314 0,260 0,380" fill="url(#headlightGlow)" opacity="0.85" />
                <ellipse cx="120" cy="314" rx="35" ry="25" fill="url(#headlightGlow)" />
              </>
            )}
          </g>

          {/* REAR LED TAILLIGHT */}
          <g opacity={headlightsOn ? 1 : 0.3} className="transition-opacity duration-700">
            <path d="M 885,270 L 898,282 L 888,295 Z" fill="#EF4444" />
            {headlightsOn && <circle cx="892" cy="282" r="14" fill="#EF4444" opacity="0.4" className="blur-sm" />}
          </g>

          {/* CINEMATIC SHINE SWEEP BEAM (Scene 3 & 4) */}
          {showShine && (
            <motion.rect
              initial={{ x: -400 }}
              animate={{ x: 1200 }}
              transition={{ duration: 1.4, ease: "easeInOut", repeat: 0 }}
              y="100"
              width="250"
              height="250"
              fill="url(#shineSweep)"
              transform="rotate(-25 500 200)"
              opacity="0.75"
              style={{ mixBlendMode: "screen" }}
            />
          )}
        </svg>
      </motion.div>
    </div>
  );
}
