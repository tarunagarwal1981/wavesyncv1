'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Header } from './Header';
import { MobileTabBar } from './MobileTabBar';
import { useLayout } from './LayoutProvider';

interface NavigationLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function NavigationLayout({ 
  children, 
  className 
}: NavigationLayoutProps) {
  const {
    user,
    profile,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    notifications,
    setNotifications,
  } = useLayout();

  const handleMenuToggle = React.useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const handleSidebarCollapse = React.useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        className="hidden lg:flex"
        collapsed={sidebarCollapsed}
        onCollapse={handleSidebarCollapse}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className={cn(
        'flex flex-col min-h-screen transition-all duration-200',
        'lg:ml-16', // Account for collapsed sidebar width
        {
          'lg:ml-64': !sidebarCollapsed,
          'lg:ml-16': sidebarCollapsed,
        }
      )}>
        {/* Header */}
        <Header
          user={{
            ...user,
            name: profile?.full_name || profile?.rank,
            avatar: profile?.avatar_url,
          }}
          notificationCount={notifications}
          onProfileClick={() => {/* Handle profile */}}
          onNotificationClick={() => {/* Handle notifications */}}
          onMenuToggle={handleMenuToggle}
          className="lg:border-0 lg:shadow-none"
        />

        {/* Main Content */}
        <main className={cn(
          'flex-1 p-4 lg:p-6',
          'pb-20 lg:pb-6', // Account for mobile tab bar
          className
        )}>
          {children}
        </main>

        {/* Mobile Bottom Tab Bar */}
        <MobileTabBar />
      </div>
    </div>
  );
}

export function CompactNavigationLayout({ 
  children, 
  className 
}: NavigationLayoutProps) {
  const {
    user,
    profile,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useLayout();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Simplified Header */}
        <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex h-12 items-center justify-between px-4">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-accent"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">W</span>
              </div>
              <span className="font-semibold text-sm">WaveSync</span>
            </div>

            {/* User avatar */}
            <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">
                {(profile?.full_name || profile?.rank || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={cn('flex-1 p-4', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function FullscreenNavigationLayout({ 
  children, 
  className 
}: NavigationLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={cn('min-h-screen', className)}>
        {children}
      </main>
    </div>
  );
}

export default NavigationLayout;
