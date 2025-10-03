import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiPaginatedSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { 
  notificationCreateSchema,
  notificationFilterSchema,
  paginationSchema 
} from '@/lib/api/validation';
import { NotificationData } from '@/lib/api/types';

// Get notifications handler
async function getNotificationsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = paginationSchema.parse(Object.fromEntries(searchParams.entries()));
    const filters = notificationFilterSchema.parse(Object.fromEntries(searchParams.entries()));

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.read !== undefined) {
      query = filters.read ? query.not('read_at', 'is', null) : query.is('read_at', null);
    }
    if (filters.createdBefore) {
      query = query.lte('created_at', filters.createdBefore);
    }
    if (filters.createdAfter) {
      query = query.gte('created_at', filters.createdAfter);
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch notifications');
    }

    return apiPaginatedSuccess(data || [], {
      page: pagination.page,
      limit: pagination.limit,
      total: count || 0,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to fetch notifications'), 500);
  }
}

// Create notification handler
async function createNotificationHandler(data: Omit<NotificationData, 'id' | 'readAt' | 'createdAt'>) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create notification');
    }

    return apiSuccess(notification, 'Notification created successfully');
  } catch (error) {
    console.error('Create notification error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to create notification'), 500);
  }
}

// Mark all notifications as read handler
async function markAllReadHandler(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read_at', null);

    if (error) {
      throw new Error('Failed to mark notifications as read');
    }

    return apiSuccess({}, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all read error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to mark notifications as read'), 500);
  }
}

// Create handlers with middleware
const getHandler = createApiHandler(getNotificationsHandler, {
  requireAuth: true,
});

const postHandler = createApiHandler(
  withValidation(notificationCreateSchema, 'body')(createNotificationHandler),
  {
    requireAuth: true,
    roles: ['admin'], // Only admins can create notifications
  }
);

const markAllReadPostHandler = createApiHandler(markAllReadHandler, {
  requireAuth: true,
});

export { getHandler as GET, postHandler as POST, markAllReadPostHandler as PATCH };



