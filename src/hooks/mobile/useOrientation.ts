import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

interface OrientationInfo {
  angle: number;
  type: Orientation;
  matches: boolean;
}

interface UseOrientationReturn {
  orientation: Orientation;
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
  isPortraitPrimary: boolean;
  isPortraitSecondary: boolean;
  isLandscapePrimary: boolean;
  isLandscapeSecondary: boolean;
  orientationInfo: OrientationInfo;
}

export function useOrientation(): UseOrientationReturn {
  const [orientationInfo, setOrientationInfo] = useState<OrientationInfo>(() => {
    // Default values for SSR
    return {
      angle: 0,
      type: 'portrait',
      matches: true,
    };
  });

  useEffect(() => {
    const updateOrientation = () => {
      const angle = window.screen?.orientation?.angle ?? window.orientation ?? 0;
      
      let type: Orientation = 'portrait';
      
      if (typeof window !== 'undefined') {
        if (angle === (-90 as any) || angle === 270) {
          type = 'landscape-primary';
        } else if (angle === (90 as any)) {
          type = 'landscape-secondary';
        } else if (angle === 180) {
          type = 'portrait-secondary';
        } else {
          type = 'portrait-primary';
        }
      }

      // Fallback based on window dimensions
      if (typeof window !== 'undefined' && window.innerWidth > window.innerHeight) {
        type = 'landscape';
      }

      setOrientationInfo({
        angle,
        type,
        matches: true,
      });
    };

    updateOrientation();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(updateOrientation, 100); // Small delay to ensure accurate reading
    };

    // Also listen for resize events as a fallback
    const handleResize = () => {
      updateOrientation();
    };

    // Modern orientation change event
    if (typeof screen !== 'undefined' && 'orientation' in screen) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof screen !== 'undefined' && 'orientation' in screen) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const isPortrait = orientationInfo.type === 'portrait' || 
                     orientationInfo.type === 'portrait-primary' || 
                     orientationInfo.type === 'portrait-secondary';

  const isLandscape = orientationInfo.type === 'landscape' || 
                      orientationInfo.type === 'landscape-primary' || 
                      orientationInfo.type === 'landscape-secondary';

  return {
    orientation: orientationInfo.type,
    angle: orientationInfo.angle,
    isPortrait,
    isLandscape,
    isPortraitPrimary: orientationInfo.type === 'portrait-primary',
    isPortraitSecondary: orientationInfo.type === 'portrait-secondary',
    isLandscapePrimary: orientationInfo.type === 'landscape-primary',
    isLandscapeSecondary: orientationInfo.type === 'landscape-secondary',
    orientationInfo,
  };
}



