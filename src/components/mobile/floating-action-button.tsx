'use client';

import { useState, ReactNode } from 'react';
import { Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FABItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive';
}

interface FloatingActionButtonProps {
  items?: FABItem[];
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  mainIcon?: ReactNode;
  expanded?: boolean;
  onMainClick?: () => void;
}

export function FloatingActionButton({
  items = [],
  className,
  position = 'bottom-right',
  mainIcon = <Plus className="h-5 w-5" />,
  expanded = false,
  onMainClick,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const toggleExpanded = () => {
    if (items.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      onMainClick?.();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      case 'top-left':
        return 'top-20 left-4';
      default:
        return 'bottom-20 right-4';
    }
  };

  const getFlexDirection = () => {
    return position.includes('bottom') ? 'flex-col-reverse' : 'flex-col';
  };

  const handleItemClick = (item: FABItem) => {
    item.onClick();
    setIsExpanded(false);
  };

  return (
    <div className={cn(
      "fixed z-50 flex gap-3 safe-area-bottom",
      getPositionClasses(),
      getFlexDirection(),
      className
    )}>
      {/* Main FAB */}
      <div className="relative">
        <Button
          onClick={toggleExpanded}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            "hover:scale-105 active:scale-95",
            isExpanded ? "rotate-45" : "rotate-0"
          )}
        >
          {mainIcon}
          <span className="sr-only">
            {items.length > 0 ? 'Toggle actions' : 'Add item'}
          </span>
        </Button>

        {/* Expandable items */}
        {items.length > 0 && (
          <div
            className={cn(
              "absolute flex gap-2 transition-all duration-300 overflow-hidden",
              position.includes('bottom') ? "bottom-full mb-3" : "top-full mt-3",
              position.includes('right') ? "right-0 flex-row-reverse" : "left-0",
              isExpanded 
                ? "opacity-100 max-w-[200px]" 
                : "opacity-0 max-w-0 pointer-events-none"
            )}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border",
                  "transition-all duration-200 ease-out",
                  isExpanded ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                  `delay-[${index * 50}ms]`
                )}
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <Button
                  variant={item.variant || 'ghost'}
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    item.variant === 'destructive' && "text-destructive hover:text-destructive"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon}
                  <span className="sr-only">{item.label}</span>
                </Button>
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Background overlay when expanded */}
      {isExpanded && items.length > 0 && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

// Compact FAB for simple actions
interface CompactFABProps {
  icon: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export function CompactFAB({
  icon,
  onClick,
  variant = 'default',
  position = 'bottom-right',
  className,
}: CompactFABProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      case 'top-left':
        return 'top-20 left-4';
      default:
        return 'bottom-20 right-4';
    }
  };

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "safe-area-bottom",
        getPositionClasses(),
        className
      )}
    >
      {icon}
      <span className="sr-only">Action button</span>
    </Button>
  );
}

// Speed dial variant
export function SpeedDial({
  items,
  mainIcon = <Plus className="h-5 w-5" />,
  position = 'bottom-right',
  className,
}: Omit<FloatingActionButtonProps, 'expanded'>) {
  return (
    <FloatingActionButton
      items={items}
      mainIcon={mainIcon}
      position={position}
      className={className}
    />
  );
}

// Default FAB presets
export const FABPresets = {
  addCertificate: {
    icon: <Plus className="h-5 w-5" />,
    label: 'Add Certificate',
    onClick: () => {},
  },
  addDocument: {
    icon: <Plus className="h-5 w-5" />,
    label: 'Add Document',
    onClick: () => {},
  },
  newQuestion: {
    icon: <Plus className="h-5 w-5" />,
    label: 'New Question',
    onClick: () => {},
  },
};
