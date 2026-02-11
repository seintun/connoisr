"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          data-testid="network-status-offline-banner"
          className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md text-white border-t border-white/10"
        >
          <div className="flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium safe-area-bottom">
            <WifiOff className="w-3 h-3 text-amber-500" />
            <span>You are offline. You can still view and add to order.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
