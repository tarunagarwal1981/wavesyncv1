'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  BellRing,
  Check,
  MoreVertical,
  Settings
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { NotificationItem } from './NotificationItem';
import { 
  Notification, 
  NotificationStats,
  NOTIFICATION_TYPE_ICONS,
  PRIORITY_COLORS 
} from '@/lib/notifications/types';
import { 
  getNotifications, 
  getNotificationStats, 
  markAllNotificationsAsRead,
  markNotificationAsRead 
} from '@/lib/notifications/queries';

interface NotificationBellProps {
  className?: string;
  showFullDropdown?: boolean;
}

export function NotificationBell({ 
  className = '',
  showFullDropdown = true 
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications
  useEffect(() => {
    loadNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        getNotifications({ limit: 5, offset: 0 }),
        getNotificationStats()
      ]);
      
      setNotifications(notificationsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
      setIsOpen(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const icon = stats && stats.unread > 0 ? BellRing : Bell;
  const iconClassName = stats && stats.unread > 0 
    ? 'text-blue-600 animate-pulse' 
    : 'text-gray-600';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative p-2 hover:bg-gray-100"
            disabled={isLoading}
          >
            <icon className={`w-5 h-5 mr-1 ${iconClassName}`} />
            
            {/* Unread badge */}
            {stats && stats.unread > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
              >
                {stats.unread > 99 ? '99+' : stats.unread}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        {showFullDropdown && (
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            {/* Header */}
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {stats && stats.unread > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-6 px-2 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-sm text-red-600">
                  Failed to load notifications
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  No notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="px-2 py-1">
                      <NotificationItem
                        notification={notification}
                        variant="compact"
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onClick={() => setIsOpen(false)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DropdownMenuSeparator />

            {/* Footer */}
            <div className="px-2 py-1">
              <Link href="/notifications">
                <DropdownMenuItem className="justify-center text-blue-600 hover:text-blue-700">
                  View all notifications
                </DropdownMenuItem>
              </Link>
              <Link href="/profile/notifications">
                <DropdownMenuItem className="justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Notification Settings
                </DropdownMenuItem>
              </Link>
            </div>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}

// Compact version for mobile header
interface NotificationBellCompactProps {
  className?: string;
}

export function NotificationBellCompact({ className = '' }: NotificationBellCompactProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const stats = await getNotificationStats();
        setUnreadCount(stats.unread);
      } catch (error) {
        console.error('Error loading notification count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/notifications" className={`relative ${className}`}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative p-2"
        disabled={isLoading}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
        
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
