import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiNotFound, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { notificationUpdateSchema, idSchema } from '@/lib/api/validation';

interface RouteParams {
  params: { id: string };
}

// Get notification handler
async function getNotificationHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const validatedId = idSchema.parse(id);

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (error || !notification) {
      return apiNotFound('Notification not found');
    }

    return apiSuccess(notification);
  } catch (error) {
    console.error('Get notification error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to fetch notification'), 500);
  }
}

// Update notification handler (mark as read)
async function updateNotificationHandler(
  request: NextRequest,
  { params }: RouteParams,
  data: { readAt?: string }
) {
  try {
    const { id } = params;
    const validatedId = idSchema.parse(id);

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    // Check if notification exists and belongs to user
    const { data: existingNotification, error: fetchError } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', validatedId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingNotification) {
      return apiNotFound('Notification not found');
    }

    const updateData = {
      read_at: data.readAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', validatedId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update notification');
    }

    return apiSuccess(notification, 'Notification updated successfully');
  } catch (error) {
    console.error('Update notification error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to update notification'), 500);
  }
}

// Delete notification handler
async function deleteNotificationHandler(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const validatedId = idSchema.parse(id);

    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');

    if (!user) {
      throw new Error('Authentication required');
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', validatedId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error('Failed to delete notification');
    }

    return apiSuccess({}, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return apiError(error instanceof Error ? error : new Error('Failed to delete notification'), 500);
  }
}

// Create handlers with middleware
const getHandler = createApiHandler(getNotificationHandler, {
  requireAuth: true,
});

const patchHandler = createApiHandler(
  withValidation(notificationUpdateSchema, 'body')(updateNotificationHandler),
  {
    requireAuth: true,
  }
);

const deleteHandler = createApiHandler(deleteNotificationHandler, {
  requireAuth: true,
});

export { getHandler as GET, patchHandler as PATCH, deleteHandler as DELETE };
