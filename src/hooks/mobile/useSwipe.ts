import { useState, useRef, useEffect } from 'react';

interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  deltaX: number;
  deltaY: number;
  velocity: number;
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
}

interface UseSwipeReturn {
  swipeEvents: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
  };
  swipeState: SwipeDirection;
  isSwiping: boolean;
}

export function useSwipe(options: UseSwipeOptions = {}): UseSwipeReturn {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeDirection>({
    direction: null,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
  });

  const [isSwiping, setIsSwiping] = useState(false);
  const startPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const calculateDirection = (
    deltaX: number,
    deltaY: number,
    threshold: number
  ): 'left' | 'right' | 'up' | 'down' | null => {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX < threshold && absDeltaY < threshold) {
      return null;
    }

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  };

  const calculateVelocity = (
    start: { x: number; y: number; time: number },
    end: { x: number; y: number; time: number }
  ): number => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const deltaTime = end.time - start.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    return deltaTime > 0 ? distance / deltaTime : 0;
  };

  const handleStart = (x: number, y: number) => {
    const time = Date.now();
    startPosRef.current = { x, y, time };
    lastPosRef.current = { x, y, time };
    setIsSwiping(true);
  };

  const handleMove = (x: number, y: number) => {
    if (!startPosRef.current || !lastPosRef.current) return;

    const currentPos = { x, y, time: Date.now() };
    const deltaX = x - startPosRef.current.x;
    const deltaY = y - startPosRef.current.y;
    const velocity = calculateVelocity(lastPosRef.current, currentPos);

    const direction = calculateDirection(deltaX, deltaY, threshold * 0.3); // Lower threshold for detection

    const newState: SwipeDirection = {
      direction,
      deltaX,
      deltaY,
      velocity,
    };

    setSwipeState(newState);
    onSwipe?.(newState);
    lastPosRef.current = currentPos;
  };

  const handleEnd = () => {
    if (!startPosRef.current || !lastPosRef.current) return;

    const { deltaX, deltaY } = swipeState;
    const direction = calculateDirection(deltaX, deltaY, threshold);

    // Call appropriate callback based on final direction
    if (direction) {
      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    }

    // Reset state
    setSwipeState({
      direction: null,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
    });
    setIsSwiping(false);
    startPosRef.current = null;
    lastPosRef.current = null;
  };

  // Touch events
  const touchEvents = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (!isSwiping) return;
      
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },

    onTouchEnd: () => {
      handleEnd();
    },
  };

  // Mouse events (for testing on desktop)
  const mouseEvents = trackMouse ? {
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },

    onMouseMove: (e: React.MouseEvent) => {
      if (!isSwiping) return;
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    },

    onMouseUp: () => {
      handleEnd();
    },
  } : {};

  return {
    swipeEvents: { ...touchEvents, ...mouseEvents },
    swipeState,
    isSwiping,
  };
}

// Specialized hooks for common gestures
export function useHorizontalSwipe(options: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) {
  return useSwipe({
    onSwipeLeft: options.onSwipeLeft,
    onSwipeRight: options.onSwipeRight,
    threshold: options.threshold,
  });
}

export function useVerticalSwipe(options: {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}) {
  return useSwipe({
    onSwipeUp: options.onSwipeUp,
    onSwipeDown: options.onSwipeDown,
    threshold: options.threshold,
  });
}

export function useSwipeToDismiss(options: {
  onDismiss: () => void;
  threshold?: number;
}) {
  return useSwipe({
    onSwipeLeft: options.onDismiss,
    onSwipeRight: options.onDismiss,
    threshold: options.threshold,
  });
}



