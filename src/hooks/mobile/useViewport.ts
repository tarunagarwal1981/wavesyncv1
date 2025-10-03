import { useEffect, useState } from 'react';

interface ViewportSize {
  width: number;
  height: number;
}

interface BreakpointMatches {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
}

interface UseViewportReturn extends ViewportSize {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpointMatches: BreakpointMatches;
  vh: number;
  vw: number;
  pixelRatio: number;
  devicePixelRatio: number;
}

// Tailwind CSS breakpoints
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useViewport(): UseViewportReturn {
  const [viewport, setViewport] = useState<UseViewportReturn>(() => {
    // Default values for SSR
    return {
      width: 0,
      height: 0,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      breakpointMatches: {
        xs: true,
        sm: false,
        md: false,
        lg: false,
        xl: false,
        '2xl': false,
      },
      vh: 0,
      vw: 0,
      pixelRatio: 1,
      devicePixelRatio: 1,
    };
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Calculate viewport units more accurately for mobile
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Determine device type
      const isMobile = width < breakpoints.md;
      const isTablet = width >= breakpoints.md && width < breakpoints.lg;
      const isDesktop = width >= breakpoints.lg;
      
      // Calculate which breakpoints are matched
      const breakpointMatches: BreakpointMatches = {
        xs: width >= breakpoints.xs,
        sm: width >= breakpoints.sm,
        md: width >= breakpoints.md,
        lg: width >= breakpoints.lg,
        xl: width >= breakpoints.xl,
        '2xl': width >= breakpoints['2xl'],
      };

      setViewport({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        breakpointMatches,
        vh,
        vw,
        pixelRatio,
        devicePixelRatio: pixelRatio,
      });
    };

    updateViewport();

    // Add debounced resize listener
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 150);
    };

    window.addEventListener('resize', handleResize);
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(updateViewport, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return viewport;
}

// Specialized hooks
export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const { breakpointMatches } = useViewport();
  return breakpointMatches[breakpoint];
}

export function useIsMobile(): boolean {
  const { isMobile } = useViewport();
  return isMobile;
}

export function useIsTablet(): boolean {
  const { isTablet } = useViewport();
  return isTablet;
}

export function useIsDesktop(): boolean {
  const { isDesktop } = useViewport();
  return isDesktop;
}

export function useViewportHeight(): number {
  const { vh } = useViewport();
  return vh;
}

export function useViewportWidth(): number {
  const { width } = useViewport();
  return width;
}

export function usePixelRatio(): number {
  const { pixelRatio } = useViewport();
  return pixelRatio;
}



