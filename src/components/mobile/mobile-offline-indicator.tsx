'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnline } from '@/hooks/mobile/useOnline';
import { cn } from '@/lib/utils';

export function MobileOfflineIndicator() {
  const { isOnline, wasOffline } = useOnline();
  const [showIndicator, setShowIndicator] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (wasOffline) {
      setIsAnimating(true);
      setShowIndicator(true);
      
      // Hide indicator after 3 seconds
      const timer = setTimeout(() => {
        setShowIndicator(false);
        setTimeout(() => setIsAnimating(false), 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [wasOffline]);

  return (
    <>
      {/* Permanent small indicator */}
      <div className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300",
        "pointer-events-none"
      )}>
        <div className={cn(
          "w-3 h-3 rounded-full border-2 border-background shadow-sm",
          isOnline ? "bg-green-500" : "bg-red-500",
          !isOnline && "animate-pulse"
        )} />
      </div>

      {/* Full indicator when coming back online */}
      {isAnimating && (
        <div className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "animate-slide-down",
          showIndicator ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        )}>
          <div className="bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
            <div className="px-4 py-3 flex items-center justify-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Connection restored
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    You're offline
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent banner for offline state */}
      {!isOnline && !isAnimating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800/50">
          <div className="px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              You're offline. Some features may not be available.
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// Mini status bar component that can be embedded in headers
export function MiniOfflineIndicator({ 
  className 
}: { 
  className?: string; 
}) {
  const { isOnline } = useOnline();

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs",
      className
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        isOnline ? "bg-green-500" : "bg-red-500"
      )} />
      <span className="text-muted-foreground">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}



