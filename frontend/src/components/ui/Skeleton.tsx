"use client";

import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

function SkeletonBase({ width = "100%", height = "16px", borderRadius = "8px", className }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, var(--color-border) 25%, var(--color-divider) 50%, var(--color-border) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite",
      }}
    />
  );
}

export function SkeletonText({ lines = 3, lastLineWidth = "60%" }: { lines?: number; lastLineWidth?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          height="14px"
          width={i === lines - 1 ? lastLineWidth : "100%"}
          borderRadius="6px"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ height = "200px" }: { height?: string }) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "var(--color-card-bg)",
      }}
    >
      <SkeletonBase height={height} borderRadius="var(--radius-md)" />
      <SkeletonBase height="20px" width="60%" borderRadius="6px" />
      <SkeletonText lines={2} />
      <SkeletonBase height="38px" borderRadius="var(--radius-sm)" />
    </div>
  );
}

export function SkeletonVehicleCard() {
  return (
    <div
      style={{
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        backgroundColor: "var(--color-card-bg)",
      }}
    >
      <SkeletonBase width="52px" height="52px" borderRadius="var(--radius-md)" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <SkeletonBase height="16px" width="50%" borderRadius="6px" />
        <SkeletonBase height="13px" width="70%" borderRadius="6px" />
      </div>
    </div>
  );
}

export function SkeletonSlot() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: "10px",
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <SkeletonBase key={i} height="44px" borderRadius="var(--radius-sm)" />
      ))}
    </div>
  );
}

export function SkeletonBookingCard() {
  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "var(--color-card-bg)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonBase height="18px" width="40%" borderRadius="6px" />
        <SkeletonBase height="24px" width="80px" borderRadius="var(--radius-pill)" />
      </div>
      <SkeletonText lines={3} />
      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        <SkeletonBase height="36px" width="120px" borderRadius="var(--radius-sm)" />
        <SkeletonBase height="36px" width="100px" borderRadius="var(--radius-sm)" />
      </div>
    </div>
  );
}

// Inject skeleton animation into document
if (typeof document !== "undefined") {
  const style = document.getElementById("skeleton-style");
  if (!style) {
    const el = document.createElement("style");
    el.id = "skeleton-style";
    el.textContent = `
      @keyframes skeleton-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(el);
  }
}

export default SkeletonBase;
