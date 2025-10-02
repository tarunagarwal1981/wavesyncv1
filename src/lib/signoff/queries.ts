'use server';

import { createClient } from '@/lib/supabase/server';
import { 
  SignoffChecklistItem, 
  SignoffProgress, 
  RelievingOfficer,
  SignoffTimeline,
  SignoffSummary,
  SignoffCategory,
  CategoryProgress
} from './types';
import { DEFAULT_CHECKLIST_ITEMS } from './defaultChecklist';

export async function getSignoffProgress(assignmentId: string): Promise<SignoffProgress | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get all checklist items for this assignment
  const { data: items, error: itemsError } = await supabase
    .from('signoff_checklist_items')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('category, order_index');

  if (itemsError) {
    throw new Error('Failed to fetch checklist items');
  }

  // Calculate overall progress
  const totalItems = items.length;
  const completedItems = items.filter(item => item.is_completed).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Calculate category progress
  const categories: SignoffCategory[] = ['administrative', 'handover', 'documentation', 'financial', 'personal_preparation'];
  const categoryProgress: Record<SignoffCategory, CategoryProgress> = {} as Record<SignoffCategory, CategoryProgress>;

  categories.forEach(category => {
    const categoryItems = items.filter(item => item.category === category);
    const completedCategoryItems = categoryItems.filter(item => item.is_completed);
    
    categoryProgress[category] = {
      total: categoryItems.length,
      completed: completedCategoryItems.length,
      percentage: categoryItems.length > 0 ? Math.round((completedCategoryItems.length / categoryItems.length) * 100) : 0,
      pendingItems: categoryItems.filter(item => !item.is_completed)
    };
  });

  // Get pending and urgent items
  const pendingItems = items.filter(item => !item.is_completed);
  const urgentItems = pendingItems.filter(item => {
    const daysUntilSignoff = getDaysUntilSignoff(assignmentId);
    return daysUntilSignoff <= 3;
  });

  return {
    totalItems,
    completedItems,
    progressPercentage,
    categoryProgress,
    pendingItems: pendingItems,
    urgentItems: urgentItems
  };
}

export async function getSignoffTimeline(assignmentId: string): Promise<SignoffTimeline | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get assignment details
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      id,
      expected_signoff_date,
      vessels!inner(vessel_name)
    `)
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .single();

  if (assignmentError || !assignment) {
    return null;
  }

  const signoffDate = assignment.expected_signoff_date;
  const currentDate = new Date().toISOString();
  const daysRemaining = signoffDate ? 
    Math.ceil((new Date(signoffDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Create timeline events based on milestones
  const timelineEvents = [
    {
      id: 'checklist-activation',
      title: 'Checklist Activation',
      description: 'Sign-off checklist becomes available',
      dueDate: getDateDaysBefore(signoffDate, 30),
      type: 'milestone' as const,
      priority: 'medium' as const,
      isCompleted: true // Always completed if we're viewing this
    },
    {
      id: 'financial-settlement',
      title: 'Financial Settlement Due',
      description: 'All financial matters should be finalized',
      dueDate: getDateDaysBefore(signoffDate, 7),
      type: 'deadline' as const,
      priority: 'high' as const,
      isCompleted: false // Check based on financial category completion
    },
    {
      id: 'final-handover',
      title: 'Final Handover Briefing',
      description: 'Conduct final handover to relieving officer',
      dueDate: getDateDaysBefore(signoffDate, 2),
      type: 'deadline' as const,
      priority: 'high' as const,
      isCompleted: false // Check based on handover category completion
    }
  ];

  return {
    assignmentId,
    signoffDate: signoffDate || '',
    currentDate,
    daysRemaining,
    timelineEvents
  };
}

export async function getSignoffChecklistItems(assignmentId: string): Promise<SignoffChecklistItem[]> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: items, error } = await supabase
    .from('signoff_checklist_items')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('user_id', user.id)
    .order('category, order_index');

  if (error) {
    throw new Error('Failed to fetch checklist items');
  }

  return items.map(item => ({
    id: item.id,
    userId: item.user_id,
    assignmentId: item.assignment_id,
    itemText: item.item_text,
    category: item.category,
    isCompleted: item.is_completed,
    completedAt: item.completed_at,
    notes: item.notes,
    isCustom: item.item_text.includes('Custom:'), // Simple way to identify custom items
    orderIndex: item.id.match(/\d+/)?.[0] ? parseInt(item.id.match(/\d+/)[0]) : 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at || item.created_at
  }));
}

export async function createDefaultChecklist(assignmentId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Check if checklist already exists
  const { data: existingItems } = await supabase
    .from('signoff_checklist_items')
    .select('id')
    .eq('assignment_id', assignmentId)
    .eq('user_id', user.id)
    .limit(1);

  if (existingItems && existingItems.length > 0) {
    return; // Checklist already exists
  }

  // Create default checklist items
  const itemsToInsert = DEFAULT_CHECKLIST_ITEMS.map(item => ({
    user_id: user.id,
    assignment_id: assignmentId,
    item_text: item.text,
    category: item.category,
    is_completed: false,
    notes: null,
    order_index: item.orderIndex,
    is_custom: false
  }));

  const { error } = await supabase
    .from('signoff_checklist_items')
    .insert(itemsToInsert);

  if (error) {
    throw new Error('Failed to create default checklist');
  }
}

export async function getSignoffSummary(assignmentId: string): Promise<SignoffSummary | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get assignment details
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      id,
      expected_signoff_date,
      vessels!inner(vessel_name)
    `)
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .single();

  if (assignmentError || !assignment) {
    return null;
  }

  // Get progress data
  const progress = await getSignoffProgress(assignmentId);
  if (!progress) {
    return null;
  }

  // Create category summary
  const categorySummary = Object.entries(progress.categoryProgress).map(([category, progress]) => ({
    category: category as SignoffCategory,
    completed: progress.completed,
    total: progress.total,
    percentage: progress.percentage
  }));

  return {
    assignmentId,
    vesselName: assignment.vessels.vessel_name,
    signoffDate: assignment.expected_signoff_date || '',
    totalProgress: progress.progressPercentage,
    categorySummary,
    outstandingItems: progress.pendingItems,
    notes: undefined
  };
}

// Helper functions
function getDaysUntilSignoff(assignmentId: string): number {
  // This would need to fetch the actual signoff date from the assignment
  // For now, return a placeholder
  return 5;
}

function getDateDaysBefore(baseDate: string | null, days: number): string {
  if (!baseDate) return new Date().toISOString();
  const date = new Date(baseDate);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
