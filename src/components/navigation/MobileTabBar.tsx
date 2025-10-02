'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard,
  TicketIcon,
  Award,
  FileText,
  CheckSquare,
  FolderOpen,
  MoreHorizontal,
} from 'lucide-react';
import { MAIN_NAVIGATION, NAVIGATION_LAYERS } from './constants';

// Selected items for mobile bottom bar (most important navigation items)
const MOBILE_NAV_ITEMS = [
  { ...MAIN_NAVIGATION.items[0], id: 'dashboard' }, // Dashboard
  { ...MAIN_NAVIGATION.items[1], id: 'tickets', icon: TicketIcon }, // Tickets
  { ...MAIN_NAVIGATION.items[2], id: 'certificates', icon: Award }, // Certificates
  { ...MAIN_NAVIGATION.items[4], id: 'circulars', icon: FileText }, // Circulars
];

export function MobileTabBar({ className }: { className?: string }) {
  const pathname = usePathname();

  const TabItem = ({ item }: { item: typeof MOBILE_NAV_ITEMS[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          'flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isActive 
            ? 'text-primary bg-primary/10' 
            : 'text-muted-foreground'
        )}
        role="tab"
        aria-label={item.label}
        aria-selected={isActive}
        tabIndex={0}
      >
        <div className="relative">
          <Icon 
            className={cn(
              'h-5 w-5 transition-colors duration-200',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )} 
            aria-hidden="true"
          />
          {item.badge && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs rounded-full min-w-4 flex items-center justify-center"
            >
              {item.badge}
            </Badge>
          )}
        </div>
        
        <span className={cn(
          'text-xs font-medium truncate transition-colors duration-200',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-card border-t border-border',
        'shadow-lg backdrop-blur-sm',
        'lg:hidden', // Hide on desktop
        className
      )}
      style={{ zIndex: NAVIGATION_LAYERS.tabbar }}
    >
      <div className="safe-area-pb px-2 py-1">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {MOBILE_NAV_ITEMS.map((item) => (
            <TabItem key={item.id} item={item} />
          ))}
        </div>
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </div>
  );
}

export function MobileTabBarMore({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      {children}
    </div>
  );
}

export function MobileTabBarFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:hidden">
      <div className="h-safe-area-inset-bottom" />
      {children}
    </div>
  );
}

// Enhanced mobile tab bar with more functionality
export function EnhancedMobileTabBar({ 
  className,
  showMore = false 
}: { 
  className?: string;
  showMore?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border',
        'backdrop-blur-md shadow-xl',
        'lg:hidden',
        className
      )}
      style={{ zIndex: NAVIGATION_LAYERS.tabbar }}
    >
      <div className="safe-area-pb">
        <div className="px-2 py-2">
          <div className={`grid gap-1 max-w-md wx-auto ${showMore ? 'grid-cols-5' : 'grid-cols-4'}`}>
            {MOBILE_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200',
                    'hover:bg-accent hover:text-accent-foreground active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground'
                  )}
                  role="tab"
                  aria-label={item.label}
                  aria-selected={isActive}
                  tabIndex={0}
                >
                  <div className="relative">
                    <Icon 
                      className={cn(
                        'h-5 w-5 transition-colors duration-200',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )} 
                      aria-hidden="true"
                    />
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs rounded-full min-w-4 flex items-center justify-center"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <span className={cn(
                    'text-xs font-medium truncate transition-colors duration-200 max-w-full',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
            
            {showMore && (
              <div className="flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium truncate max-w-full text-muted-foreground">
                  More
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Safe area for devices with home indicator */}
        <div className="h-safe-area-inset-bottom bg-card" />
    </div>
  </div>
  );
}

export default MobileTabBar;