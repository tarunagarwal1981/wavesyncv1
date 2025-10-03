export interface CircularAttachment {
  url: string;
  filename: string;
  size?: number;
  type?: string;
}

export interface CircularFilters {
  category?: 'safety' | 'operation' | 'administrative' | 'crew_change';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  status?: 'read' | 'unread' | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CircularListResponse {
  circulars: CircularWithStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CircularWithStatus extends CircularData {
  isRead: boolean;
  isAcknowledged: boolean;
  readAt?: string;
  acknowledgedAt?: string;
}

export interface CircularData {
  id: string;
  title: string;
  referenceNumber?: string;
  category: 'safety' | 'operation' | 'administrative' | 'crew_change';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  issueDate: string;
  content: string;
  attachments?: CircularAttachment[];
  publishedBy: string;
  publisherName?: string;
  requiresAcknowledgment: boolean;
  createdAt: string;
}

export interface CircularAcknowledgment {
  id: string;
  circularId: string;
  userId: string;
  readAt?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export type CircularCategory = 'safety' | 'operation' | 'administrative' | 'crew_change';
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';
export type ReadStatus = 'read' | 'unread' | 'all';

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  urgent: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200', 
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  low: 'text-gray-600 bg-gray-50 border-gray-200'
};

export const CATEGORY_COLORS: Record<CircularCategory, string> = {
  safety: 'text-red-700 bg-red-100',
  operation: 'text-blue-700 bg-blue-100',
  administrative: 'text-purple-700 bg-purple-100',
  crew_change: 'text-green-700 bg-green-100'
};

export const CATEGORY_LABELS: Record<CircularCategory, string> = {
  safety: 'Safety',
  operation: 'Operations', 
  administrative: 'Administrative',
  crew_change: 'Crew Change'
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  urgent: 'Urgent',
  high: 'Important',
  medium: 'Normal',
  low: 'Low Priority'
};



