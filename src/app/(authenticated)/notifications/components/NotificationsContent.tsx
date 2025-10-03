'use client';

import React, { useState, useEffect } from 'react';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Bell,
  BellRing,
  Check,
  Trash2,
  Settings,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  TrendingUp
} from 'lucide-react';
import { 
  NotificationGroup,
  NotificationFilter,
  NotificationStats
} from '@/lib/notifications/types';
import { 
  getNotificationGroups, 
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications
} from '@/lib/notifications/queries';
import { toast } from 'sonner';

export function NotificationsContent() {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [filters, setFilters] = useState<NotificationFilter>({ dateRange: 'all' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  // Reload when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotifications();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [groupsData, statsData] = await Promise.all([
        getNotificationGroups(),
        getNotificationStats()
      ]);

      // Apply filters to groups
      let filteredGroups = groupsData;
      
      if (filters.type) {
        filteredGroups = filteredGroups.map(group => ({
          ...group,
          notifications: group.notifications.filter(n => n.type === filters.type)
        })).filter(group => group.notifications.length > 0);
      }

      if (filters.priority) {
        filteredGroups = filteredGroups.map(group => ({
          ...group,
          notifications: group.notifications.filter(n => n.priority === filters.priority)
        })).filter(group => group.notifications.length > 0);
      }

      if (filters.isRead !== undefined) {
        filteredGroups = filteredGroups.map(group => ({
          ...group,
          notifications: group.notifications.filter(n => n.isRead === filters.isRead)
        })).filter(group => group.notifications.length > 0);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredGroups = filteredGroups.map(group => ({
          ...group,
          notifications: group.notifications.filter(n => 
            n.title.toLowerCase().includes(searchTerm) ||
            n.message.toLowerCase().includes(searchTerm)
          )
        })).filter(group => group.notifications.length > 0);
      }

      setGroups(filteredGroups);
      setStats(statsData);
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
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      await clearAllNotifications();
      await loadNotifications();
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('Failed to clear all notifications');
    }
  };

  const totalNotifications = groups.reduce((sum, group) => sum + group.count, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-full">
                  <BellRing className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-900">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Urgent</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.urgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Filter Notifications
            </CardTitle>
            <div className="text-sm text-gray-500">
              {totalNotifications} notification{totalNotifications !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <NotificationFilters
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Notifications
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadNotifications}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      {!error && (
        <NotificationList
          groups={groups}
          isLoading={isLoading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
          showActions={true}
        />
      )}
    </div>
  );
}



