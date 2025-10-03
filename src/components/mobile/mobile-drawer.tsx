'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  children: ReactNode;
  className?: string;
}

interface DrawerHandleProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function DrawerHandle({ collapsed, onToggle, className }: DrawerHandleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center justify-center w-full py-2 transition-colors",
        "hover:bg-muted active:bg-muted/80",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-12 h-1 bg-muted rounded-full" />
        <div className={cn(
          "transition-transform duration-200",
          collapsed ? "rotate-0" : "rotate-180"
        )}>
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
        <div className="w-12 h-1 bg-muted rounded-full" />
      </div>
    </button>
  );
}

export function MobileDrawer({ children, className }: MobileDrawerProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(isCollapsed ? 100 : Math.min(contentHeight + 40, 400));
    }
  }, [isCollapsed]);

  return (
    <div
      className={cn(
        "bg-background border-t border-border transition-all duration-300 ease-out",
        "safe-area-bottom",
        className
      )}
      style={{
        height: `${height}px`,
        maxHeight: isCollapsed ? '100px' : '400px',
      }}
    >
      {/* Handle */}
      <DrawerHandle
        collapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out px-4 pb-4",
          isCollapsed ? "opacity-0 max-h-0" : "opacity-100 max-h-[300px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}



