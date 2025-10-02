'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Menu, 
  Search,
  Bell,
} from 'lucide-react';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import type { HeaderProps } from './types';

export function Header({
  user,
  notificationCount = 0,
  onProfileClick,
  onNotificationClick,
  onMenuToggle,
  className,
}: HeaderProps & { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm',
        'transition-all duration-200',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left section - Mobile menu + Search */}
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              onClick={onMenuToggle}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Center section - Logo for mobile */}
          <div className="flex lg:hidden">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">W</span>
              </div>
            </div>
          </div>

          {/* Right section - Theme toggle + Notifications + User menu */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <ThemeToggle />

            <Separator orientation="vertical" className="h-4" />

            {/* Notification bell */}
            <NotificationBell
              count={notificationCount}
              onClick={onNotificationClick}
            />

            <Separator orientation="vertical" className="h-4" />

            {/* User menu */}
            <UserMenu
              user={user}
              onProfile={onProfileClick}
              onSettings={() => {/* Handle settings */}}
              onLogout={() => {/* Handle logout */}}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function CompactHeader({
  user,
  notificationCount = 0,
  onProfileClick,
  onNotificationClick,
  onMenuToggle,
  className,
}: HeaderProps & { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md',
        'transition-all duration-200',
        className
      )}
    >
      <div className="px-4">
        <div className="flex h-12 items-center justify-between gap-4">
          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Page title or breadcrumb could go here */}
          <div className="flex-1 text-center">
            <span className="font-medium text-sm text-muted-foreground">
              WaveSync
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <NotificationBell
              count={notificationCount}
              onClick={onNotificationClick}
              className="h-8 w-8"
            />
            
            <UserMenu
              user={user}
              onProfile={onProfileClick}
              compact
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
  user,
  notificationCount = 0,
  onProfileClick,
  onNotificationClick,
  className,
}: HeaderProps & {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md',
        'transition-all duration-200',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Title section */}
          <div className="flex flex-col gap-1">
            {title && (
              <h1 className="text-lg font-semibold text-foreground leading-none">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions}
            
            <ThemeToggle />

            <Separator orientation="vertical" className="h-4" />

            <NotificationBell
              count={notificationCount}
              onClick={onNotificationClick}
            />

            <Separator orientation="vertical" className="h-4" />

            <UserMenu
              user={user}
              onProfile={onProfileClick}
              onSettings={() => {/* Handle settings */}}
              onLogout={() => {/* Handle logout */}}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
