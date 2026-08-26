"use client";

import React from "react";
import { Download, X } from "lucide-react";
import { usePWAInstall, IOSInstallModal } from "./InstallApp";

export default function InstallAppButton() {
  const {
    canInstall,
    isStandalone,
    showIOSModal,
    setShowIOSModal,
    triggerInstall,
    dismissPrompt,
  } = usePWAInstall();

  if (!canInstall || isStandalone) return null;

  return (
    <>
      <div
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
        }}
        className="fixed left-4 right-4 z-[990] mx-auto max-w-sm border border-[#19C7F3]/40 bg-[#0D1115]/95 p-3 shadow-2xl backdrop-blur-md transition-all sm:left-auto sm:right-6 sm:mx-0"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#19C7F3] bg-[#19C7F3] font-black text-xs text-black">
              BW
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-tight text-[#F5F7F8]">
                Install The Black Wash
              </p>
              <p className="text-[10px] text-[#A7B0B7]">
                Faster doorstep wash booking from home screen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={triggerInstall}
              className="inline-flex h-8 items-center gap-1 border border-[#19C7F3] bg-[#19C7F3] px-3 text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-[#19C7F3]/90 active:scale-95"
            >
              <Download size={13} /> Install
            </button>

            <button
              type="button"
              onClick={dismissPrompt}
              aria-label="Dismiss install prompt"
              className="flex h-8 w-8 items-center justify-center border border-[#26313A] text-[#707A82] transition hover:text-[#F5F7F8]"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    </>
  );
}
