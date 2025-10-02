'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  CircularData, 
  CircularWithStatus, 
  CircularListResponse, 
  CircularFilters,
  CircularAcknowledgment
} from './types';

export async function getCirculars(filters: CircularFilters = {}): Promise<CircularListResponse> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const {
    category,
    priority,
    status = 'all',
    search,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20
  } = filters;

  let query = supabase
    .from('circulars')
    .select(`
      id,
      title,
      reference_number,
      category,
      priority,
      issue_date,
      content,
      attachments,
      published_by,
      profiles!published_by(users!inner(email, user_metadata))
    `)
    .order('priority', { ascending: false })
    .order('issue_date', { ascending: false });

  // Apply filters
  if (category) {
    query = query.eq('category', category);
  }

  if (priority) {
    query = query.eq('priority', priority);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  if (dateFrom) {
    query = query.gte('issue_date', dateFrom);
  }

  if (dateTo) {
    query = query.lte('issue_date', dateTo);
  }

  // Get total count first
  const { count } = await query.select('id').limit(0);
  const total = count || 0;

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data: circulars, error: error } = await query;

  if (error) {
    throw new Error('Failed to fetch circulars');
  }

  // Get circular acknowledgments for read/unread filtering
  const { data: acknowledgments } = await supabase
    .from('circular_acknowledgments')
    .select('circular_id, read_at, acknowledged_at')
    .eq('user_id', user.id);

  const acknowledgmentMap = new Map(
    acknowledgments?.map(ack => [ack.circular_id, ack]) || []
  );

  // Apply read/unread filter
  let filteredCirculars = circulars || [];
  if (status === 'read') {
    filteredCirculars = filteredCirculars.filter(circular => 
      acknowledgmentMap.has(circular.id) && acknowledgmentMap.get(circular.id)?.read_at
    );
  } else if (status === 'unread') {
    filteredCirculars = filteredCirculars.filter(circular => 
      !acknowledgmentMap.has(circular.id) || !acknowledgmentMap.get(circular.id)?.read_at
    );
  }

  // Transform to include read/acknowledgment status
  const circularsWithStatus: CircularWithStatus[] = filteredCirculars.map(circular => {
    const acknowledgment = acknowledgmentMap.get(circular.id);
    return {
      ...circular,
      referenceNumber: circular.reference_number,
      issueDate: circular.issue_date,
      publishedBy: circular.published_by,
      publisherName: circular.profiles?.users?.email || 'Unknown',
      attachments: circular.attachments || [],
      isRead: !!acknowledgment?.read_at,
      isAcknowledged: !!acknowledgment?.acknowledged_at,
      readAt: acknowledgment?.read_at,
      acknowledgedAt: acknowledgment?.acknowledged_at
    };
  });

  return {
    circulars: circularsWithStatus,
    pagination: {
      page,
      limit,
      total: total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getCircularById(id: string): Promise<CircularWithStatus | null> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: circular, error } = await supabase
    .from('circulars')
    .select(`
      id,
      title,
      reference_number,
      category,
      priority,
      issue_date,
      content,
      attachments,
      published_by,
      requires_acknowledgment,
      created_at,
      profiles!published_by(users!inner(email, user_metadata))
    `)
    .eq('id', id)
    .single();

  if (error || !circular) {
    return null;
  }

  // Get acknowledgment status
  const { data: acknowledgment } = await supabase
    .from('circular_acknowledgments')
    .select('*')
    .eq('circular_id', id)
    .eq('user_id', user.id)
    .single();

  return {
    ...circular,
    referenceNumber: circular.reference_number,
    issueDate: circular.issue_date,
    publishedBy: circular.published_by,
    publisherName: circular.profiles?.users?.email || 'Unknown',
    attachments: circular.attachments || [],
    isRead: !!acknowledgment?.read_at,
    isAcknowledged: !!acknowledgment?.acknowledged_at,
    readAt: acknowledgment?.read_at,
    acknowledgedAt: acknowledgment?.acknowledged_at
  };
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return 0;
  }

  const { count } = await supabase
    .from('circulars')
    .select('id', { count: 'exact' })
    .not('id', 'in', `(select circular_id from circular_acknowledgments where user_id = '${user.id}' and read_at is not null)`);

  return count || 0;
}

export async function getUnreadAcknowledgmentCount(): Promise<number> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return 0;
  }

  const { count } = await supabase
    .from('circulars')
    .select('id', { count: 'exact' })
    .eq('requires_acknowledgment', true)
    .not('id', 'in', `(select circular_id from circular_acknowledgments where user_id = '${user.id}' and acknowledged_at is not null)`);

  return count || 0;
}
