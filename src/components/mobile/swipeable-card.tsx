'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Archive, Eye } from 'lucide-react';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  action: () => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  className?: string;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function SwipeableCard({
  children,
  className,
  leftActions = [],
  rightActions = [],
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
}: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startTranslateX, setStartTranslateX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartTranslateX(translateX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const newTranslateX = startTranslateX + deltaX;
    
    // Limit swipe distance
    const maxTranslate = Math.max(thresolds * -1, newTranslateX);
    const minTranslate = Math.min(threshold * 2, maxTranslate);
    
    setTranslateX(Math.max(minTranslate, maxTranslate));
    
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Determine if swipe threshold is met
    if (translateX < -threshold) {
      onSwipeLeft?.();
      setTranslateX(-threshold);
    } else if (translateX > threshold) {
      onSwipeRight?.();
      setTranslateX(threshold);
    } else {
      setTranslateX(0);
    }
  };

  const handleAction = (actionCallback: () => void) => {
    actionCallback();
    setTranslateX(0);
  };

  const getSwipeProgress = (maxTranslate: number) => {
    const progress = Math.min(Math.abs(translateX) / maxTranslate, 1);
    return Math.max(0, progress);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div 
          className={cn(
            "absolute left-0 top-0 h-full flex items-center",
            "transition-transform duration-200 ease-out"
          )}
          style={{
            transform: `translateX(${Math.min(translateX + threshold, 0)}px)`,
          }}
        >
          <div className="flex gap-1 px-2">
            {leftActions.map((action, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                className={cn(
                  "rounded-full p-2 opacity-0 transition-opacity",
                  getSwipeProgress(threshold) > 0.3 && "opacity-100"
                )}
                style={{ backgroundColor: action.color }}
                onClick={() => handleAction(action.action)}
              >
                {action.icon}
                <span className="sr-only">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div 
          className={cn(
            "absolute right-0 top-0 h-full flex items-center",
            "transition-transform duration-200 ease-out"
          )}
          style={{
            transform: `translateX(${Math.max(translateX - threshold, 0)}px)`,
          }}
        >
          <div className="flex gap-1 px-2">
            {rightActions.map((action, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                className={cn(
                  "rounded-full p-2 opacity-0 transition-opacity",
                  getSwipeProgress(threshold) > 0.3 && "opacity-100"
                )}
                style={{ backgroundColor: action.color }}
                onClick={() => handleAction(action.action)}
              >
                {action.icon}
                <span className="sr-only">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main card */}
      <Card
        ref={cardRef}
        className={cn(
          "relative transition-transform duration-200 ease-out touch-pan-x",
          isDragging ? "scale-[0.98]" : "scale-100",
          className
        )}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </Card>
    </div>
  );
}

// Preset action configurations
export const SwipeActions = {
  edit: (action: () => void): SwipeAction => ({
    icon: <Edit className="h-4 w-4" />,
    label: 'Edit',
    color: 'hsl(var(--primary))',
    action,
  }),
  
  archive: (action: () => void): SwipeAction => ({
    icon: <Archive className="h-4 w-4" />,
    label: 'Archive',
    color: 'hsl(var(--chart-4))',
    action,
  }),
  
  delete: (action: () => void): SwipeAction => ({
    icon: <Trash2 className="h-4 w-4" />,
    label: 'Delete',
    color: 'hsl(var(--destructive))',
    action,
  }),
  
  view: (action: () => void): SwipeAction => ({
    icon: <Eye className="h-4 w-4" />,
    label: 'View',
    color: 'hsl(var(--secondary))',
    action,
  }),
};
