'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight,
  Menu,
} from 'lucide-react';
import { MAIN_NAVIGATION, USER_NAVIGATION, NAVIGATION_LAYERS } from './constants';
import type { SidebarProps } from './types';

export function Sidebar({
  className,
  isMobile = false,
  collapsed = false,
  onCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.();
  }, [isCollapsed, onCollapse]);

  const NavigationItem = ({ item }: { item: typeof MAIN_NAVIGATION.items[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`group flex items-center gap-3 rounded-lg ${
          isCollapsed ? 'px-2 py-2' : 'px-3 py-2'
        } transition-colors duration-200 hover:bg-accent hover:text-accent-foreground ${
          isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
        } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={item.label}
        tabIndex={item.disabled ? -1 : 0}
      >
        <Icon
          className={`h-4 w-4 shrink-0 ${
            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
          }`}
          aria-hidden="true"
        />
        
        {!isCollapsed && (
          <>
            <span className="truncate font-medium">{item.label}</span>
            {item.badge && (
              <Badge 
                variant={isActive ? 'secondary' : 'outline'} 
                className={`ml-auto text-xs ${
                  isActive 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-background text-foreground'
                }`}
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'h-full bg-card border-r border-border flex flex-col transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-64',
        isMobile ? 'absolute left-0 top-0 z-50 shadow-lg' : 'sticky top-0',
        className
      )}
      style={{ zIndex: isMobile ? NAVIGATION_LAYERS.sidebar : 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">W</span>
            </div>
            <span className="font-semibold text-lg">WaveSync</span>
          </div>
        )}
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 shrink-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          <div className="space-y-1">
            {MAIN_NAVIGATION.items.map((item) => (
              <NavigationItem key={item.id} item={item} />
            ))}
          </div>
          
          <Separator className="my-4" />
          
          {/* User Navigation */}
          <div className="space-y-1">
            {USER_NAVIGATION.items.map((item) => (
              <NavigationItem key={item.id} item={item} />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Maritime Operations Platform
          </div>
        </div>
      )}
    </aside>
  );
}

export function MobileSidebar({
  className,
  isOpen,
  onClose,
}: SidebarProps & { 
  isOpen?: boolean; 
  onClose?: () => void; 
}) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <Sidebar
        className={cn(
          'fixed top-0 left-0 h-full transform transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        isMobile={true}
      />
    </>
  );
}
