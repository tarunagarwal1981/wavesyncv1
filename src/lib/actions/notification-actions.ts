'use server';

import { supabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { idSchema } from '@/lib/api/validation';

// Mark notification as read action
export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const validatedId = idSchema.parse(notificationId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Update notification as read
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate notifications
    revalidatePath('/notifications');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: notification,
      message: 'Notification marked as read',
    };
  } catch (error) {
    console.error('Mark notification as read action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notification as read',
    };
  }
}

// Delete notification action
export async function deleteNotificationAction(notificationId: string) {
  try {
    const validatedId = idSchema.parse(notificationId);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', validatedId)
      .eq('user_id', user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate notifications
    revalidatePath('/notifications');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  } catch (error) {
    console.error('Delete notification action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete notification',
    };
  }
}

// Mark all notifications as read action
export async function markAllNotificationsAsReadAction() {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Update all unread notifications
    const { error, count } = await supabase
      .from('notifications')
      .update({
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('read_at', null);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate paths
    revalidatePath('/notifications');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Marked ${count || 0} notifications as read`,
    };
  } catch (error) {
    console.error('Mark all notifications as read action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
    };
  }
}

// Get notification count action
export async function getNotificationCountAction() {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Get unread notification count
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('read_at', null);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        unreadCount: notifications?.length || 0,
      },
    };
  } catch (error) {
    console.error('Get notification count action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get notification count',
    };
  }
}

// Get notifications action (with pagination)
export async function getNotificationsAction(
  page: number = 1,
  limit: number = 10,
  type?: string,
  priority?: string
) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: notifications, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        notifications: notifications || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
    };
  } catch (error) {
    console.error('Get notifications action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get notifications',
    };
  }
}

// Create notification action (admin only)
export async function createNotificationAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const type = formData.get('type') as string;
    const priority = formData.get('priority') as string || 'medium';
    const userId = formData.get('userId') as string;
    const actionUrl = formData.get('actionUrl') as string;

    if (!title || !message || !type || !userId) {
      return {
        success: false,
        error: 'Title, message, type, and user ID are required',
      };
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        title,
        message,
        type,
        priority,
        user_id: userId,
        action_url: actionUrl,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: notification,
      message: 'Notification created successfully',
    };
  } catch (error) {
    console.error('Create notification action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notification',
    };
  }
}
