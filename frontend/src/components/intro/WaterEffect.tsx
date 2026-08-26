"use client";

import React, { useEffect, useRef } from "react";

interface WaterEffectProps {
  active: boolean;
  cleanProgress: number; // 0 to 1
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function WaterEffect({ active, cleanProgress }: WaterEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const createParticles = () => {
      const sprayX = canvas.width * cleanProgress;
      const sprayY = canvas.height * 0.55;

      // Emit high-velocity jet spray particles
      const count = window.innerWidth < 640 ? 12 : 25;
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() - 0.5) * 0.6; // Spray cone angle
        const speed = Math.random() * 18 + 12;
        const colorChoice = Math.random() > 0.4 ? "rgba(25, 199, 243, " : "rgba(255, 255, 255, ";

        particles.push({
          x: sprayX - Math.random() * 40,
          y: sprayY + (Math.random() - 0.5) * 120,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 3 + 1),
          radius: Math.random() * 3.5 + 1.2,
          alpha: Math.random() * 0.7 + 0.3,
          life: 0,
          maxLife: Math.random() * 25 + 15,
          color: colorChoice,
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (cleanProgress > 0 && cleanProgress < 1) {
        createParticles();

        // Render Water Spray Beam / High-Pressure Nozzle Wave
        const sprayX = canvas.width * cleanProgress;
        const gradient = ctx.createLinearGradient(sprayX - 180, 0, sprayX + 60, 0);
        gradient.addColorStop(0, "rgba(25, 199, 243, 0)");
        gradient.addColorStop(0.5, "rgba(25, 199, 243, 0.25)");
        gradient.addColorStop(0.85, "rgba(255, 255, 255, 0.6)");
        gradient.addColorStop(1, "rgba(25, 199, 243, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const currentAlpha = p.alpha * (1 - p.life / p.maxLife);

        if (currentAlpha <= 0 || p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#19C7F3";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, cleanProgress]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  );
}
