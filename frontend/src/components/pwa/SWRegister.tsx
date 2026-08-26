"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New service worker version available safely
                    console.log("New version of The Black Wash available.");
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error("ServiceWorker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
