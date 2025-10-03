export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export type NotificationType = 
  | 'certificate_expiry'
  | 'travel_reminder'
  | 'new_circular'
  | 'signoff_reminder'
  | 'system_announcement'
  | 'document_update'
  | 'crew_message'
  | 'general';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationFilter {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  search?: string;
  dateRange?: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'all';
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  urgent: number;
  byType: Record<NotificationType, number>;
}

export interface NotificationGroup {
  label: string;
  notifications: Notification[];
  count: number;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  certificate_expiry: 'Certificate Expiry',
  travel_reminder: 'Travel Reminder',
  new_circular: 'New Circular',
  signoff_reminder: 'Sign-off Reminder',
  system_announcement: 'System Announcement',
  document_update: 'Document Update',
  crew_message: 'Crew Message',
  general: 'General'
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  certificate_expiry: '📜',
  travel_reminder: '✈️',
  new_circular: '📢',
  signoff_reminder: '✅',
  system_announcement: '🔧',
  document_update: '📄',
  crew_message: '👥',
  general: '💬'
};

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: 'text-gray-600 bg-gray-50',
  medium: 'text-blue-600 bg-blue-50',
  high: 'text-orange-600 bg-orange-50',
  urgent: 'text-red-600 bg-red-50'
};

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  enabledTypes: NotificationType[];
  digestFrequency: 'daily' | 'weekly' | 'never';
  quietHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface NotificationTrigger {
  id: string;
  type: NotificationType;
  triggerEvent: string; // e.g., 'certificate_expiry_6_months'
  conditions: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_NOTIFICATION_TEMPLATES = {
  certificate_expiry: {
    title: 'Certificate Expiring Soon',
    message: 'Your {certificate_type} certificate expires on {expiry_date}. Please renew it soon to avoid any complications.',
    priority: 'high' as NotificationPriority
  },
  travel_reminder: {
    title: 'Travel Reminder',
    message: 'You have {travel_type} scheduled for {departure_date} at {departure_time} from {departure_location}.',
    priority: 'medium' as NotificationPriority
  },
  new_circular: {
    title: 'New Circular Available',
    message: 'A new circular "{circular_title}" has been published. Please review and acknowledge if required.',
    priority: 'medium' as NotificationPriority
  },
  signoff_reminder: {
    title: 'Sign-off Checklist Reminder',
    message: 'Don\'t forget to complete your sign-off checklist before leaving the vessel.',
    priority: 'medium' as NotificationPriority
  },
  system_announcement: {
    title: 'System Announcement',
    message: '{announcement_message}',
    priority: 'medium' as NotificationPriority
  },
  document_update: {
    title: 'Document Updated',
    message: 'Your document "{document_name}" has been updated.',
    priority: 'low' as NotificationPriority
  },
  crew_message: {
    title: 'Message from Crew Management',
    message: '{message_content}',
    priority: 'medium' as NotificationPriority
  }
};



