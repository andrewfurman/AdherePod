"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Share, PlusSquare, Download } from "lucide-react";
import Image from "next/image";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    }

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    if (isStandalone) return;

    // Check localStorage for recent dismissal
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < DISMISS_DURATION_MS) return;
        localStorage.removeItem(DISMISS_KEY);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing), continue showing
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      setShowBanner(true);
    }

    // Android/Chromium: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Hide banner if app gets installed
    const installedHandler = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    const result = await deferredPrompt.prompt();
    if (result.outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // localStorage unavailable
    }
    setShowBanner(false);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        {/* App icon */}
        <Image
          src="/icon-192x192.png"
          alt="AdherePod"
          width={44}
          height={44}
          className="rounded-xl"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isIOS ? (
            <div>
              <p className="text-sm font-medium text-white">
                Add AdherePod to your Home Screen
              </p>
              <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-1 flex-wrap">
                Tap <Share className="inline h-3.5 w-3.5" /> Share, then{" "}
                <PlusSquare className="inline h-3.5 w-3.5" /> Add to Home
                Screen
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-white">
                Add AdherePod to your Home Screen
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Quick access, just like an app
              </p>
            </div>
          )}
        </div>

        {/* Install button (Android/Chrome only) */}
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
          >
            <Download className="h-4 w-4" />
            Install
          </button>
        )}

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 rounded-full p-1 text-gray-500 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
