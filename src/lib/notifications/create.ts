import { createClient } from '@/lib/supabase/server';
import { 
  CreateNotificationData, 
  NotificationType, 
  NotificationPriority,
  DEFAULT_NOTIFICATION_TEMPLATES,
  NotificationPreferences
} from './types';

/**
 * Create a notification for a specific user
 */
export async function createNotification(data: CreateNotificationData): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get user preferences to check if this notification type is enabled
    const preferences = await getUserNotificationPreferences(data.userId);
    if (preferences && !preferences.enabledTypes.includes(data.type)) {
      console.log(`Notification type ${data.type} disabled for user ${data.userId}`);
      return false; // Notification type is disabled
    }

    const notificationData = {
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'medium',
      action_url: data.actionUrl,
      action_text: data.actionText,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      expires_at: data.expiresAt || null,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('notifications')
      .insert(notificationData);

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return false;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[], 
  notificationData: Omit<CreateNotificationData, 'userId'>
): Promise<number> {
  let successCount = 0;

  for (const userId of userIds) {
    const success = await createNotification({
      ...notificationData,
      userId
    });
    if (success) successCount++;
  }

  return successCount;
}

/**
 * Create notification using a template
 */
export async function createNotificationFromTemplate(
  userId: string,
  type: NotificationType,
  templateData: Record<string, any> = {}
): Promise<boolean> {
  const template = DEFAULT_NOTIFICATION_TEMPLATES[type];
  if (!template) {
    console.error(`No template found for notification type: ${type}`);
    return false;
  }

  // Replace template variables in title and message
  let title = template.title;
  let message = template.message;
  let priority = template.priority as NotificationPriority;

  Object.entries(templateData).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    title = title.replace(new RegExp(placeholder, 'g'), String(value));
    message = message.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return createNotification({
    userId,
    type,
    title,
    message,
    priority,
    metadata: templateData
  });
}

/**
 * Create system-wide announcements
 */
export async function createSystemAnnouncement(
  announcement: string,
  priority: NotificationPriority = 'medium'
): Promise<void> {
  const supabase = await createClient();
  
  // Get all active users
  const { data: users } = await supabase
    .from('profiles')
    .select('id');

  if (users && users.length > 0) {
    const userIds = users.map(user => user.id);
    
    await createBulkNotifications(userIds, {
      type: 'system_announcement',
      title: 'System Announcement',
      message: announcement,
      priority,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
  }
}

/**
 * Create certificate expiry notification
 */
export async function createCertificateExpiryNotification(
  userId: string,
  certificateName: string,
  expiryDate: string,
  expiryDays: number
): Promise<boolean> {
  const determinePriority = (days: number): NotificationPriority => {
    if (days <= 14) return 'urgent';
    if (days <= 30) return 'high';
    if (days <= 90) return 'medium';
    return 'low';
  };

  const priority = determinePriority(expiryDays);
  const actionUrl = '/certificates';
  const actionText = 'View Certificates';

  return createNotificationFromTemplate(userId, 'certificate_expiry', {
    certificate_type: certificateName,
    expiry_date: expiryDate,
    days_remaining: expiryDays
  });
}

/**
 * Create travel reminder notification
 */
export async function createTravelReminderNotification(
  userId: string,
  travelType: string,
  departureDate: string,
  departureTime: string,
  departureLocation: string
): Promise<boolean> {
  const determinePriority = (hoursUntilDeparture: number): NotificationPriority => {
    if (hoursUntilDeparture <= 3) return 'urgent';
    if (hoursUntilDeparture <= 24) return 'high';
    if (hoursUntilDeparture <= 72) return 'medium';
    return 'low';
  };

  const departure = new Date(`${departureDate} ${departureTime}`);
  const now = new Date();
  const hoursUntilDeparture = Math.floor((departure.getTime() - now.getTime()) / (1000 * 60 * 60));

  const priority = determinePriority(hoursUntilDeparture);

  return createNotificationFromTemplate(userId, 'travel_reminder', {
    travel_type: travelType,
    departure_date: departureDate,
    departure_time: departureTime,
    departure_location: departureLocation,
    hours_until: Math.max(0, hoursUntilDeparture)
  });
}

/**
 * Create new circular notification
 */
export async function createNewCircularNotification(
  userIds: string[],
  circularId: string,
  circularTitle: string,
  requiresAcknowledgment: boolean
): Promise<void> {
  const priority: NotificationPriority = requiresAcknowledgment ? 'high' : 'medium';
  const actionUrl = `/circulars/${circularId}`;
  const actionText = requiresAcknowledgment ? 'Review & Acknowledge' : 'View Circular';

  for (const userId of userIds) {
    await createNotification({
      userId,
      type: 'new_circular',
      title: 'New Circular Available',
      message: `A new circular "${circularTitle}" has been published. Please review${requiresAcknowledgment ? ' and acknowledge' : ''} if required.`,
      priority,
      actionUrl,
      actionText,
      metadata: { circularId, requiresAcknowledgment }
    });
  }
}

/**
 * Create sign-off reminder notification
 */
export async function createSignOffReminderNotification(
  userId: string,
  vesselName?: string
): Promise<boolean> {
  const message = vesselName 
    ? `Don't forget to complete your sign-off checklist before leaving ${vesselName}.`
    : "Don't forget to complete your sign-off checklist before leaving the vessel.";

  return createNotification({
    userId,
    type: 'signoff_reminder',
    title: 'Sign-off Checklist Reminder',
    message,
    priority: 'medium',
    actionUrl: '/signoff',
    actionText: 'Complete Sign-off'
  });
}

/**
 * Create document update notification
 */
export async function createDocumentUpdateNotification(
  userId: string,
  documentName: string,
  action: 'updated' | 'deleted' | 'shared'
): Promise<boolean> {
  const messages = {
    updated: `Your document "${documentName}" has been updated.`,
    deleted: `Your document "${documentName}" has been deleted.`,
    shared: `Your document "${documentName}" has been shared with you.`
  };

  return createNotification({
    userId,
    type: 'document_update',
    title: 'Document Update',
    message: messages[action],
    priority: 'low',
    actionUrl: '/documents',
    actionText: 'View Documents',
    metadata: { documentName, action }

  });
}

/**
 * Get user notification preferences
 */
async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  const supabase = await createClient();
  
  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return preferences || null;
}

/**
 * Create notification for unacknowledged circulars
 */
export async function createUnacknowledgedCircularReminder(
  userId: string,
  circularTitle: string,
  circularId: string,
  daysOverdue: number
): Promise<boolean> {
  const priority: NotificationPriority = daysOverdue > 7 ? 'urgent' : 'high';
  
  return createNotification({
    userId,
    type: 'new_circular',
    title: 'Unread Circular Reminder',
    message: `You have an unacknowledged circular "${circularTitle}" that requires attention. Please review and acknowledge.`,
    priority,
    actionUrl: `/circulars/${circularId}`,
    actionText: 'Review Circular',
    metadata: { circularId, circularTitle, daysOverdue }
  });
}

/**
 * Clean up expired notifications
 */
export async function cleanupExpiredNotifications(): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error cleaning up expired notifications:', error);
  } else {
    console.log('Expired notifications cleaned up successfully');
  }
}
