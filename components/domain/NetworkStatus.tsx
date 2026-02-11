'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    let onlineTimer: ReturnType<typeof setTimeout> | null = null;

    function handleOnline() {
      setIsOffline(false);
      setShowOnlineMessage(true);
      if (onlineTimer) clearTimeout(onlineTimer);
      onlineTimer = setTimeout(() => setShowOnlineMessage(false), 2200);
    }
    function handleOffline() {
      setIsOffline(true);
      setShowOnlineMessage(false);
      if (onlineTimer) clearTimeout(onlineTimer);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (onlineTimer) clearTimeout(onlineTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {(isOffline || showOnlineMessage) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          data-testid="network-status-offline-banner"
          className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md text-white border-t border-white/10"
        >
          <div
            className={`flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium safe-area-bottom ${
              isOffline ? 'bg-black/80' : 'bg-emerald-700/90'
            }`}
          >
            {isOffline ? (
              <WifiOff className="w-3 h-3 text-amber-500" />
            ) : (
              <Wifi className="w-3 h-3 text-emerald-200" />
            )}
            <span>
              {isOffline
                ? 'You are offline. You can still browse and add items.'
                : 'Back online. You can send your order now.'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
