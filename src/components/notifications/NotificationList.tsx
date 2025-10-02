'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from './NotificationItem';
import { NotificationGroup } from '@/lib/notifications/types';
import { Check, Trash2, Clock } from 'lucide-react';

interface NotificationListProps {
  groups: NotificationGroup[];
  isLoading?: boolean;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (notificationId: string) => void;
  onClearAll?: () => void;
  showActions?: boolean;
}

export function NotificationList({ 
  groups, 
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  showActions = true
}: NotificationListProps) {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    const allNotificationIds = groups.flatMap(group => 
      group.notifications.map(notif => notif.id)
    );
    
    setSelectedNotifications(
      selectedNotifications.length === allNotificationIds.length 
        ? [] 
        : allNotificationIds
    );
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => onMarkAsRead?.(id));
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => onDelete?.(id));
    setSelectedNotifications([]);
  };

  if (isLoading) {
    return <NotificationListSkeleton />;
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-4">
          <Clock className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No notifications
        </h3>
        <p className="text-gray-500 max-w-sm">
          You're all caught up! New notifications will appear here when they arrive.
        </p>
      </div>
    );
  }

  const totalNotifications = groups.reduce((sum, group) => sum + group.count, 0);
  const unreadCount = groups.reduce((sum, group) => 
    sum + group.notifications.filter(n => !n.isRead).length, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-gray-600">
            {unreadCount} unread • {totalNotifications} total
          </p>
        </div>

        {/* Bulk Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            {selectedNotifications.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkMarkAsRead}
                  disabled={selectedNotifications.length === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Read
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedNotifications.length === 0}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                
                <span className="text-sm text-gray-500">
                  {selectedNotifications.length} selected
                </span>
              </>
            )}

            <Button 
              variant="outline" 
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Notification Groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-3">
            {/* Group Header */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <h3 className="font-medium text-gray-900">{group.label}</h3>
              <span className="text-sm text-gray-500">
                {group.count} notification{group.count !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              {group.notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => onMarkAsRead?.(notification.id)}
                  onDelete={() => onDelete?.(notification.id)}
                  showActions={showActions}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Group Skeletons */}
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          {/* Group Header Skeleton */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Notification Skeletons */}
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, itemIndex) => (
              <div key={itemIndex} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
