"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:hidden">
      <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Install Aura</h3>
            <p className="text-white/90 text-sm mt-1">
              Install our app for a better experience and quick access!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Button
          onClick={handleInstall}
          className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
        >
          Install Now
        </Button>
      </div>
    </div>
  );
}
