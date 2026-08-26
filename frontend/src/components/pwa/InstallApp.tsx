"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

const DISMISS_KEY = "blackwash_install_dismissed";
const DISMISS_DAYS = 14;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Standalone detection
    const matchStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = (navigator as any).standalone === true;
    const installed = matchStandalone || isIOSStandalone;
    setIsStandalone(installed);

    // 2. iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);

    // 3. Dismissal check
    const dismissedTime = localStorage.getItem(DISMISS_KEY);
    if (dismissedTime) {
      const diffMs = Date.now() - parseInt(dismissedTime, 10);
      if (diffMs < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // 4. Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
    setShowIOSModal(false);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (isStandalone) return;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  }, [isStandalone, deferredPrompt, isIOS]);

  const canInstall = !isStandalone && !isDismissed && (!!deferredPrompt || isIOS);

  return {
    isStandalone,
    canInstall,
    isIOS,
    showIOSModal,
    setShowIOSModal,
    triggerInstall,
    dismissPrompt,
  };
}

export function IOSInstallModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm border border-[#26313A] bg-[#0D1115] p-5 text-[#F5F7F8] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-[#26313A] text-[#707A82] transition hover:text-[#F5F7F8]"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-2 text-[#19C7F3]">
          <Download size={20} />
          <h3 className="font-extrabold text-base uppercase tracking-tight">
            Install The Black Wash
          </h3>
        </div>

        <p className="text-xs text-[#A7B0B7] mb-4">
          Add The Black Wash to your iPhone home screen for fast doorstep booking access:
        </p>

        <div className="space-y-3 text-xs bg-[#080A0C] border border-[#26313A] p-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#19C7F3] text-[10px] font-extrabold text-black">
              1
            </span>
            <p className="text-[#F5F7F8]">
              Tap the <strong className="text-[#19C7F3]">Share button</strong> <Share size={14} className="inline mx-1 text-[#19C7F3]" /> at the bottom of Safari.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#19C7F3] text-[10px] font-extrabold text-black">
              2
            </span>
            <p className="text-[#F5F7F8]">
              Scroll down and tap <strong className="text-[#19C7F3]">"Add to Home Screen"</strong> <PlusSquare size={14} className="inline mx-1 text-[#19C7F3]" />.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#19C7F3] text-[10px] font-extrabold text-black">
              3
            </span>
            <p className="text-[#F5F7F8]">
              Tap <strong className="text-[#19C7F3]">"Add"</strong> in the top right corner.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full h-10 border border-[#19C7F3] bg-[#19C7F3] text-xs font-bold uppercase tracking-wider text-black transition hover:bg-[#19C7F3]/90"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
