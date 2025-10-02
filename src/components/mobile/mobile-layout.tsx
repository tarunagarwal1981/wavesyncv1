'use client';

import { usePathname } from 'next/navigation';
import { Suspense, ReactNode } from 'react';
import { MobileHeader } from './mobile-header';
import { MobileNav } from './mobile-nav';
import { MobileOfflineIndicator } from './mobile-offline-indicator';
import { useOnline } from '@/hooks/mobile/useOnline';
import { useBreakpoint } from '@/hooks/mobile/useViewport';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  user?: {
    name: string;
    avatar?: string;
  };
}

// Hide navigation on certain pages
const PAGES_WITHOUT_NAV = ['/auth', '/offline'];
const PAGES_WITHOUT_HEADER = ['/auth'];

export function MobileLayout({
  children,
  title,
  showNotifications = true,
  notificationCount = 0,
  user,
}: MobileLayoutProps) {
  const pathname = usePathname();
  const { isOffline } = useOnline();
  const isMobile = useBreakpoint('md');

  const showTopNavigation = !PAGES_WITHOUT_HEADER.some(path => pathname.startsWith(path));
  const showBottomNavigation = isMobile && !PAGES_WITHOUT_NAV.some(path => pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-background">
      {/* Offline indicator */}
      <MobileOfflineIndicator />

      {/* Main content area */}
      <div className={cn(
        "flex flex-col",
        showTopNavigation && "pt-safe-area-top",
        showBottomNavigation && "pb-20 safe-area-bottom",
      )}>
        {/* Top Navigation */}
        {showTopNavigation && (
          <MobileHeader
            title={title}
            showNotifications={showNotifications}
            notificationCount={notificationCount}
            user={user}
          />
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <Suspense fallback={<MobileSkeletonLoader />}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Bottom Navigation */}
      {showBottomNavigation && (
        <MobileNav notificationCount={notificationCount} />
      )}

      {/* Offline overlay */}
      {isOffline && (
        <div className="fixed inset-0 bg-background z-50">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 o 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 012 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold">You're offline</h2>
                <p className="text-muted-foreground">Some features may not be available</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading skeleton for mobile
function MobileSkeletonLoader() {
  return (
    <div className="space-y-4 p-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
      </div>

      {/* Cards skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Mobile content wrapper with safe areas
export function MobileContent({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "min-h-screen px-4 py-4",
      "safe-area-top safe-area-bottom",
      className
    )}>
      {children}
    </div>
  );
}

// Mobile section wrapper
export function MobileSection({ 
  children, 
  title,
  action,
  className 
}: { 
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && (
            <h2 className="text-lg font-semibold">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// Mobile grid component
export function MobileGrid({
  children,
  columns = 1,
  gap = 4,
  className
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  gap?: number;
  className?: string;
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  };

  return (
    <div className={cn(
      'grid gap-' + gap,
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
}
