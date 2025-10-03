'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
  refreshingThreshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  threshold = 70,
  refreshingThreshold = 50,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [maxY, setMaxY] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    if (scrollTop > 0) return; // Only allow pull-to-refresh at the top
    
    setStartY(e.touches[0].clientY);
    setMaxY(e.touches[0].clientY);
    setHasMoved(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !containerRef.current || !hasMoved) return;
    
    const scrollTop = containerRef.current.scrollTop;
    if (scrollTop > 0) return; // Only allow pull-to-refresh at the top
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    if (deltaY > 0) {
      setMaxY(Math.max(maxY, currentY));
      const distance = Math.min(deltaY * 0.5, threshold * 2); // Elastic effect
      setPullDistance(distance);
      setCanRefresh(distance >= refreshingThreshold);
      
      if (distance > 0) {
        e.preventDefault(); // Prevent page scroll
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!hasMoved) return;
    
    setHasMoved(false);
    
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        if (refreshPromiseRef.current) {
          await refreshPromiseRef.current;
        } else {
          refreshPromiseRef.current = onRefresh();
          await refreshPromiseRef.current;
        }
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        refreshPromiseRef.current = null;
        setCanRefresh(false);
      }
    }
    
    // Reset pull state
    setTimeout(() => {
      setPullDistance(0);
      setMaxY(0);
      setCanRefresh(false);
    }, 150);
  };

  const refreshProgress = Math.min(pullDistance / refreshingThreshold, 1);
  const shouldShowIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div className={cn("relative", className)}>
      {/* Pull-to-refresh indicator */}
      <div
        className={cn(
          "flex items-center justify-center h-12 transition-all duration-200 ease-out",
          "absolute top-0 left-0 right-0 z-10",
          shouldShowIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translateY(${-100 + (refreshProgress * 100)}%)`,
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full shadow-sm border">
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Refreshing...</span>
            </>
          ) : (
            <>
              <ArrowDown 
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  canRefresh ? "rotate-0" : "rotate-180"
                )}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {canRefresh ? "Release to refresh" : "Pull to refresh"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="overflow-auto h-full"
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.3, threshold * 0.3)}px)`,
          transition: isRefreshing ? 'transform 0.2s ease-out' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Higher-order component wrapper
export function withPullToRefresh<T extends { onRefresh?: () => Promise<void> }>(
  WrappedComponent: React.ComponentType<T>,
  refreshOptions?: Partial<PullToRefreshProps>
) {
  return function PullToRefreshWrapper(props: T) {
    return (
      <PullToRefresh
        onRefresh={props.onRefresh || (() => Promise.resolve())}
        {...refreshOptions}
      >
        <WrappedComponent {...props} />
      </PullToRefresh>
    );
  };
}

// List component with pull-to-refresh
interface RefreshableListProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export function RefreshableList({
  children,
  onRefresh,
  className,
  threshold = 70,
  disabled = false,
}: RefreshableListProps) {
  return (
    <PullToRefresh
      onRefresh={onRefresh || (() => Promise.resolve())}
      className={className}
      threshold={threshold}
      disabled={disabled}
    >
      <div className="space-y-2 p-4">
        {children}
      </div>
    </PullToRefresh>
  );
}



