"use client";

import React, { useState, useEffect } from "react";
import BlackWashIntro from "./BlackWashIntro";

interface IntroWrapperProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "theBlackWashIntroSeen";

export default function IntroWrapper({ children }: IntroWrapperProps) {
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    const hasSeenIntro = localStorage.getItem(STORAGE_KEY);

    if (!hasSeenIntro) {
      setShowIntro(true);
    }

    // Expose developer helper method to reset intro state from console
    (window as any).resetBlackWashIntro = () => {
      localStorage.removeItem(STORAGE_KEY);
      console.log("Black Wash Intro state cleared! Reloading page...");
      window.location.reload();
    };
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShowIntro(false);
  };

  return (
    <>
      {isClient && showIntro && <BlackWashIntro onComplete={handleIntroComplete} />}
      <div className={showIntro ? "opacity-0" : "opacity-100 transition-opacity duration-700"}>
        {children}
      </div>
    </>
  );
}
