export interface SignoffChecklistItem {
  id: string;
  userId: string;
  assignmentId: string;
  itemText: string;
  category: SignoffCategory;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  isCustom: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  attachments?: SignoffAttachment[];
}

export interface SignoffAttachment {
  id: string;
  checklistItemId: string;
  filename: string;
  url: string;
  size?: number;
  type?: string;
  uploadedAt: string;
}

export type SignoffCategory = 
  | 'administrative' 
  | 'handover' 
  | 'documentation' 
  | 'financial' 
  | 'personal_preparation';

export interface SignoffProgress {
  totalItems: number;
  completedItems: number;
  progressPercentage: number;
  categoryProgress: Record<SignoffCategory, CategoryProgress>;
  pendingItems: SignoffChecklistItem[];
  urgentItems: SignoffChecklistItem[];
}

export interface CategoryProgress {
  total: number;
  completed: number;
  percentage: number;
  pendingItems: SignoffChecklistItem[];
}

export interface RelievingOfficer {
  id: string;
  userId: string;
  name: string;
  rank: string;
  email: string;
  phone?: string;
  joiningDate: string;
  previousVessel?: string;
  notes?: string;
}

export interface SignoffTimeline {
  assignmentId: string;
  signoffDate: string;
  currentDate: string;
  daysRemaining: number;
  timelineEvents: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  type: 'milestone' | 'deadline' | 'reminder';
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface SignoffSummary {
  assignmentId: string;
  vesselName: string;
  signoffDate: string;
  totalProgress: number;
  categorySummary: CategorySummary[];
  outstandingItems: SignoffChecklistItem[];
  relievingOfficer?: RelievingOfficer;
  notes?: string;
}

export interface CategorySummary {
  category: SignoffCategory;
  completed: number;
  total: number;
  percentage: number;
}

export const CATEGORY_LABELS: Record<SignoffCategory, string> = {
  administrative: 'Administrative Tasks',
  handover: 'Handover Tasks', 
  documentation: 'Documentation',
  financial: 'Financial Settlement',
  personal_preparation: 'Personal Preparation'
};

export const CATEGORY_COLORS: Record<SignoffCategory, string> = {
  administrative: 'bg-blue-50 text-blue-700 border-blue-200',
  handover: 'bg-green-50 text-green-700 border-green-200',
  documentation: 'bg-purple-50 text-purple-700 border-purple-200', 
  financial: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  personal_preparation: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

export const CATEGORY_ICONS: Record<SignoffCategory, string> = {
  administrative: '📋',
  handover: '🤝', 
  documentation: '📄',
  financial: '💰',
  personal_preparation: '👤'
};

export const TIMELINE_EVENT_TYPES = {
  milestone: '🎯',
  deadline: '⏰', 
  reminder: '🔔'
};

export const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
  low: 'text-blue-600 bg-blue-50 border-blue-200'
};
