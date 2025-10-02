'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { NotificationBellProps } from './types';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  read: boolean;
  href?: string;
}

export function NotificationBell({
  count = 0,
  onClick,
  className,
}: NotificationBellProps) {
  const [open, setOpen] = React.useState(false);

  // Mock notifications for now
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Certificate Expiring',
      message: 'Your STCW Basic Safety Training expires in 30 days.',
      type: 'warning',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
      href: '/dashboard/certificates',
    },
    {
      id: '2',
      title: 'Assignment Update',
      message: 'New assignment to MV Ocean Explorer confirmed.',
      type: 'info',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      href: '/dashboard/assignments',
    },
    {
      id: '3',
      title: 'Circular Published',
      message: 'New safety circular available for review.',
      type: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      href: '/dashboard/circulars',
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayCount = count || unreadCount;

  const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    const icons = {
      info: Info,
      success: CheckCircle2,
      warning: AlertTriangle,
      error: AlertTriangle,
    };
    
    const Icon = icons[type];
    const colors = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
    };

    return <Icon className={cn('h-4 w-4', colors[type])} />;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-9 w-9',
            'hover:bg-accent hover:text-accent-foreground',
            className
          )}
          aria-label={`Notifications ${displayCount > 0 ? `(${displayCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {displayCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs rounded-full min-w-5 flex items-center justify-center"
            >
              {displayCount > 99 ? '99+' : displayCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        alignOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {displayCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        
        {/* Notifications */}
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        !notification.read && 'bg-blue-50/50'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <NotificationIcon type={notification.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <CircleDot className="h-2 w-2 text-blue-500 mt-1 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className={cn(
                      'flex items-start gap-3 p-3 rounded-lg',
                      !notification.read && 'bg-blue-50/50'
                    )}>
                      <NotificationIcon type={notification.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <CircleDot className="h-2 w-2 text-blue-500 mt-1 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {index < notifications.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full justify-center text-xs"
                onClick={() => {
                  setOpen(false);
                  onClick?.();
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationBellCompact({
  count = 0,
  onClick,
  className,
}: NotificationBellProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'relative h-8 w-8',
        'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={onClick}
      aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ''}`}
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs rounded-full min-w-4 flex items-center justify-center"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </Button>
  );
}

export default NotificationBell;
