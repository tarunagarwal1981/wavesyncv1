import { useState, useRef, useEffect } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  tapCount: number;
  lastTapTime: number;
}

interface UseTouchOptions {
  onTouchStart?: (event: TouchState) => void;
  onTouchMove?: (event: TouchState) => void;
  onTouchEnd?: (event: TouchState) => void;
  onTap?: (event: TouchState) => void;
  onDoubleTap?: (event: TouchState) => void;
  onLongPress?: (event: TouchState) => void;
  onPinchStart?: (scale: number) => void;
  onPinchMove?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
  longPressDelay?: number;
  doubleTapDelay?: number;
  preventDefault?: boolean;
}

interface UseTouchReturn {
  touchEvents: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  touchState: TouchState;
  isPressed: boolean;
}

export function useTouch(options: UseTouchOptions = {}): UseTouchReturn {
  const {
    onTouchStart: onTouchStartCallback,
    onTouchMove: onTouchMoveCallback,
    onTouchEnd: onTouchEndCallback,
    onTap: onTapCallback,
    onDoubleTap: onDoubleTapCallback,
    onLongPress: onLongPressCallback,
    onPinchStart: onPinchStartCallback,
    onPinchMove: onPinchMoveCallback,
    onPinchEnd: onPinchEndCallback,
    longPressDelay = 500,
    doubleTapDelay = 300,
    preventDefault = false,
  } = options;

  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    tapCount: 0,
    lastTapTime: 0,
  });

  const [isPressed, setIsPressed] = useState(false);
  const startTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Handle single touch
  const handleSingleTouch = (touches: TouchList) => {
    const touch = touches[0];
    const currentTime = Date.now();

    // Detect tap count
    if (currentTime - lastTapTimeRef.current < doubleTapDelay) {
      setTouchState(prev => ({ ...prev, tapCount: prev.tapCount + 1 }));
    } else {
      setTouchState(prev => ({ ...prev, tapCount: 1 }));
    }
    lastTapTimeRef.current = currentTime;

    const newTouchState: TouchState = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      tapCount: currentTime - lastTapTimeRef.current < doubleTapDelay ? touchState.tapCount + 1 : 1,
      lastTapTime: currentTime,
    };

    setTouchState(newTouchState);
    setIsPressed(true);
    startTimeRef.current = currentTime;

    onTouchStartCallback?.(newTouchState);

    // Setup long press detection
    longPressTimerRef.current = setTimeout(() => {
      onLongPressCallback?.(newTouchState);
    }, longPressDelay);
  };

  // Handle pinch gesture
  const handlePinchGesture = (touches: TouchList) => {
    if (touches.length !== 2) return;

    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    // Store initial distance for pinch calculations
    if (!startTimeRef.current) {
      startTimeRef.current = distance;
      onPinchStartCallback?.(1);
    } else {
      const scale = distance / startTimeRef.current;
      onPinchMoveCallback?.(scale);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touches = e.touches;

    if (touches.length === 1) {
      handleSingleTouch(touches);
    } else if (touches.length === 2) {
      handlePinchGesture(touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    if (!isPressed) return;

    const touches = e.touches;

    if (touches.length === 1) {
      const touch = touches[0];
      
      setTouchState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: touch.clientX - prev.startX,
        deltaY: touch.clientY - prev.startY,
      }));

      onTouchMoveCallback?.({
        ...touchState,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: touch.clientX - touchState.startX,
        deltaY: touch.clientY - touchState.startY,
      });
    } else if (touches.length === 2) {
      handlePinchGesture(touches);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const currentTime = Date.now();
    const duration = currentTime - startTimeRef.current;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Determine if it's a tap (short duration, small movement)
    const isTap = duration < longPressDelay && 
                  Math.abs(touchState.deltaX) < 10 && 
                  Math.abs(touchState.deltaY) < 10;

    if (isTap) {
      if (touchState.tabCount === 1) {
        onTapCallback?.(touchState);
      } else if (touchState.tapCount >= 2) {
        onDoubleTapCallback?.(touchState);
      }
    }

    // Handle pinch end
    if (e.touches.length === 0 && e.changedTouches.length === 2) {
      onPinchEndCallback?.(1);
    }

    onTouchEndCallback?.(touchState);

    // Reset state
    setIsPressed(false);
    startTimeRef.current = 0;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    touch события: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    touchState,
    isPressed,
  };
}

// Specialized hooks for common touch patterns
export function useLongPress(options: {
  onLongPress: () => void;
  delay?: number;
}) {
  return useTouch({
    onLongPress: options.onLongPress,
    longPressDelay: options.delay,
  });
}

export function useDoubleTap(options: {
  onDoubleTap: () => void;
  delay?: number;
}) {
  return useTouch({
    onDoubleTap: options.onDoubleTap,
    doubleTapDelay: options.delay,
  });
}

export function useTap(options: {
  onTap: () => void;
}) {
  return useTouch({
    onTap: options.onTap,
  });
}

export function usePinch(options: {
  onPinchStart?: (scale: number) => void;
  onPinchMove?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
}) {
  return useTouch({
    onPinchStart: options.onPinchStart,
    onPinchMove: options.onPinchMove,
    onPinchEnd: options.onPinchEnd,
  });
}
