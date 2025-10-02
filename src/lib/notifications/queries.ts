'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  Notification, 
  NotificationFilter, 
  NotificationStats,
  NotificationGroup,
  NotificationPreferences,
  CreateNotificationData
} from './types';

/**
 * Get notifications for the current user with filtering and pagination
 */
export async function getNotifications(filter: NotificationFilter = {}): Promise<Notification[]> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filter.type) {
    query = query.eq('type', filter.type);
  }

  if (filter.priority) {
    query = query.eq('priority', filter.priority);
  }

  if (filter.isRead !== undefined) {
    query = query.eq('is_read', filter.isRead);
  }

  if (filter.search) {
    query = query.or(`title.ilike.%${filter.search}%,message.ilike.%${filter.search}%`);
  }

  if (filter.dateRange) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter.dateRange) {
      case 'today':
        query = query.gte('created_at', today.toISOString());
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', yesterday.toISOString()).lt('created_at', today.toISOString());
        break;
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        query = query.gte('created_at', weekStart.toISOString());
        break;
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        query = query.gte('created_at', monthStart.toISOString());
        break;
    }
  }

  // Apply pagination
  if (filter.limit) {
    query = query.limit(filter.limit);
  }
  
  if (filter.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
  }

  const { data: notifications, error } = await query;

  if (error) {
    throw new Error('Failed to fetch notifications');
  }

  // Filter out results that have expired
  const now = new Date();
  return (notifications || []).filter(notification => 
    !notification.expires_at || new Date(notification.expires_at) > now
  );
}

/**
 * Get notification groups by date
 */
export async function getNotificationGroups(): Promise<NotificationGroup[]> {
  const notifications = await getNotifications();
  const groups: NotificationGroup[] = [];
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  // Group notifications
  const todayNotifications = notifications.filter(n => 
    new Date(n.created_at) >= today
  );
  
  const yesterdayNotifications = notifications.filter(n => {
    const notificationDate = new Date(n.created_at);
    return notificationDate >= yesterday && notificationDate < today;
  });
  
  const weekNotifications = notifications.filter(n => {
    const notificationDate = new Date(n.created_at);
    return notificationDate >= weekStart && notificationDate < yesterday;
  });
  
  const olderNotifications = notifications.filter(n => 
    new Date(n.created_at) < weekStart
  );

  // Create groups
  if (todayNotifications.length > 0) {
    groups.push({
      label: 'Today',
      notifications: todayNotifications,
      count: todayNotifications.length
    });
  }

  if (yesterdayNotifications.length > 0) {
    groups.push({
      label: 'Yesterday',
      notifications: yesterdayNotifications,
      count: yesterdayNotifications.length
    });
  }

  if (weekNotifications.length > 0) {
    groups.push({
      label: 'This Week',
      notifications: weekNotifications,
      count: weekNotifications.length
    });
  }

  if (olderNotifications.length > 0) {
    groups.push({
      label: 'Older',
      notifications: olderNotifications,
      count: olderNotifications.length
    });
  }

  return groups;
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<NotificationStats> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get all notifications for stats
  const { data: notifications } = await supabase
    .from('notifications')
    .select('type, priority, is_read')
    .eq('user_id', user.id)
    .gte('expires_at', new Date().toISOString()); // Only non-expired

  const stats: NotificationStats = {
    total: 0,
    unread: 0,
    highPriority: 0,
    urgent: 0,
    byType: {} as Record<string, number>
  };

  if (notifications) {
    stats.total = notifications.length;
    stats.unread = notifications.filter(n => !n.is_read).length;
    stats.highPriority = notifications.filter(n => n.priority === 'high').length;
    stats.urgent = notifications.filter(n => n.priority === 'urgent').length;

    // Count by type
    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });
  }

  return stats;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to mark notification as read');
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

/**
 * Mark multiple notifications as read
 */
export async function markNotificationsAsRead(notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return;

  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .in('id', notificationIds)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to mark notifications as read');
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    throw new Error('Failed to mark all notifications as read');
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to delete notification');
  }

  revalidatePath('/notifications');
}

/**
 * Delete multiple notifications
 */
export async function deleteNotifications(notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return;

  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .in('id', notificationIds)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to delete notifications');
  }

  revalidatePath('/notifications');
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to clear all notifications');
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return preferences || null;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      ...preferences
    });

  if (error) {
    throw new Error('Failed to update notification preferences');
  }

  revalidatePath('/profile');
}

/**
 * Get unread notification count for the bell icon
 */
export async function getUnreadCount(): Promise<number> {
  const stats = await getNotificationStats();
  return stats.unread;
}
