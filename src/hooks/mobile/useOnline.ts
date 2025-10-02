import { useEffect, useState } from 'react';

interface UseOnlineReturn {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  onlineAt: Date | null;
  offlineAt: Date | null;
}

export function useOnline(): UseOnlineReturn {
  const [onlineStatus, setOnlineStatus] = useState<UseOnlineReturn>(() => {
    // Default to true for SSR
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      wasOffline: false,
      onlineAt: null,
      offlineAt: null,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      
      setOnlineStatus(prev => {
        const newStatus: UseOnlineReturn = {
          isOnline,
          isOffline: !isOnline,
          wasOffline: prev.isOffline && !prev.wasOffline,
          onlineAt: !prev.isOnline && isOnline ? new Date() : prev.onlineAt,
          offlineAt: prev.isOnline && !isOnline ? new Date() : prev.offlineAt,
        };

        // Reset wasOffline after a brief moment
        if (newStatus.wasOffline) {
          setTimeout(() => {
            setOnlineStatus(current => ({ ...current, wasOffline: false }));
          }, 1000);
        }

        return newStatus;
      });
    };

    // Set up event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial status
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return onlineStatus;
}

export default useOnline;

// Hook to get connection type and quality (when available)
interface NetworkInfo {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  saveData?: boolean;
}

export function useNetworkInfo(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Network Information API is supported
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          saveData: connection.saveData,
        });
      };

      // Listen for changes
      connection.addEventListener('change', updateNetworkInfo);
      
      // Initial info
      updateNetworkInfo();

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

// Hook to detect slow connection
export function useConnectionQuality() {
  const networkInfo = useNetworkInfo();
  const [quality, setQuality] = useState<'slow' | 'medium' | 'fast'>('medium');

  useEffect(() => {
    if (networkInfo.effectiveType) {
      switch (networkInfo.effectiveType) {
        case 'slow-2g':
        case '2g':
          setQuality('slow');
          break;
        case '3g':
          setQuality('medium');
          break;
        case '4g':
          setQuality('fast');
          break;
        default:
          setQuality('medium');
      }
    } else if (networkInfo.downlink) {
      if (networkInfo.downlink < 1) {
        setQuality('slow');
      } else if (networkInfo.downlink < 10) {
        setQuality('medium');
      } else {
        setQuality('fast');
      }
    }
  }, [networkInfo]);

  return {
    quality,
    isSlow: quality === 'slow',
    isMedium: quality === 'medium',
    isFast: quality === 'fast',
    networkInfo,
  };
}
