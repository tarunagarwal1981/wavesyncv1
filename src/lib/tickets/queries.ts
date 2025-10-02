import { createClient } from '@/lib/supabase/server';
import type { 
  TicketDetails, 
  TicketFilters, 
  TicketSortOptions,
  FlightStatus,
  TravelReminder 
} from './types';

export interface TicketQueryOptions {
  filters?: TicketFilters;
  sort?: TicketSortOptions;
  limit?: number;
  offset?: number;
}

export interface TicketsWithCount {
  tickets: TicketDetails[];
  total: number;
}

/**
 * Get all tickets for a user with optional filtering and sorting
 */
export async function getTickets(
  userId: string,
  options: TicketQueryOptions = {}
): Promise<TicketsWithCount> {
  const supabase = await createClient();
  
  let query = supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);
  
  // Apply filters
  if (options.filters) {
    const { 
      status, 
      ticket_type, 
      travel_purpose, 
      date_from, 
      date_to, 
      airline, 
      search_term 
    } = options.filters;
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (ticket_type && ticket_type !== 'all') {
      query = query.eq('ticket_type', ticket_type);
    }
    
    if (travel_purpose && travel_purpose !== 'all') {
      query = query.eq('travel_purpose', travel_purpose);
    }
    
    if (date_from) {
      query = query.gte('departure_datetime', date_from);
    }
    
    if (date_to) {
      query = query.lte('departure_datetime', date_to);
    }
    
    if (airline && airline !== 'all') {
      query = query.eq('airline', airline);
    }
    
    if (search_term) {
      query = query.or(
        `booking_reference.ilike.%${search_term}%,airline.ilike.%${search_term}%,flight_number.ilike.%${search_term}%,departure_airport.ilike.%${search_term}%,arrival_airport.ilike.%${search_term}%`
      );
    }
  }
  
  // Apply sorting
  if (options.sort) {
    const { sort_by, order } = options.sort;
    query = query.order(sort_by, { ascending: order === 'asc' });
  } else {
    // Default: upcoming flights first, by departure time
    query = query.order('departure_datetime', { ascending: true });
  }
  
  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }
  
  const { data: tickets, count, error } = await query;
  
  if (error) {
    console.error('Error fetching tickets:', error);
    return { tickets: [], total: 0 };
  }
  
  return { 
    tickets: tickets || [], 
    total: count || 0 
  };
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(
  ticketId: string,
  userId: string
): Promise<TicketDetails | null> {
  const supabase = await createClient();
  
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }
  
  return ticket;
}

/**
 * Get tickets for a specific assignment
 */
export async function getTicketsForAssignment(
  assignmentId: string,
  userId: string,
  options: TicketQueryOptions = {}
): Promise<TicketsWithCount> {
  const supabase = await createClient();
  
  let query = supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('assignment_id', assignmentId);
  
  // Apply filters (same logic as getTickets)
  if (options.filters) {
    const { status, ticket_type, date_from, date_to } = options.filters;
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (ticket_type && ticket_type !== 'all') {
      query = query.eq('ticket_type', ticket_type);
    }
    
    if (date_from) {
      query = query.gte('departure_datetime', date_from);
    }
    
    if (date_to) {
      query = query.lte('departure_datetime', date_to);
    }
  }
  
  // Apply sorting
  if (options.sort) {
    const { sort_by, order } = options.sort;
    query = query.order(sort_by, { ascending: order === 'asc' });
  } else {
    query = query.order('departure_datetime', { ascending: true });
  }
  
  const { data: tickets, count, error } = await query;
  
  if (error) {
    console.error('Error fetching assignment tickets:', error);
    return { tickets: [], total: 0 };
  }
  
  return { 
    tickets: tickets || [], 
    total: count || 0 
  };
}

/**
 * Get upcoming tickets (departure within next 30 days)
 */
export async function getUpcomingTickets(
  userId: string,
  limit: number = 5
): Promise<TicketDetails[]> {
  const supabase = await createClient();
  
  // Calculate date 30 days from now
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .gte('departure_datetime', new Date().toISOString())
    .lte('departure_datetime', thirtyDaysFromNow.toISOString())
    .order('departure_datetime', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching upcoming tickets:', error);
    return [];
  }
  
  return tickets || [];
}

/**
 * Get ticket statistics for dashboard
 */
export async function getTicketStats(userId: string): Promise<{
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  nextTravel?: Date;
}> {
  const supabase = await createClient();
  
  const now = new Date();
  
  // Get all tickets for stats
  const { data: allTickets } = await supabase
    .from('tickets')
    .select('status, departure_datetime')
    .eq('user_id', userId);
  
  if (!allTickets) {
    return { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
  }
  
  const stats = allTickets.reduce((acc, ticket) => {
    acc.total++;
    
    if (ticket.status === 'completed') acc.completed++;
    if (ticket.status === 'cancelled') acc.cancelled++;
    
    // Consider it upcoming if departure is in the future
    if (ticket.departure_datetime) {
      const departureDate = new Date(ticket.departure_datetime);
      if (departureDate > now && ticket.status !== 'completed' && ticket.status !== 'cancelled') {
        acc.upcoming++;
      }
    }
    
    return acc;
  }, { total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  
  // Find next travel date
  const futureTickets = allTickets
    .filter(ticket => ticket.departure_datetime)
    .map(ticket => new Date(ticket.departure_datetime!))
    .filter(date => date > now)
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (futureTickets.length > 0) {
    stats.nextTravel = futureTickets[0];
  }
  
  return stats;
}

/**
 * Create a new ticket
 */
export async function createTicket(
  userId: string,
  ticketData: Omit<TicketDetails, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ ticket: TicketDetails | null; error: string | null }> {
  const supabase = await createClient();
  
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      ...ticketData,
      user_id: userId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating ticket:', error);
    return { ticket: null, error: error.message };
  }
  
  return { ticket, error: null };
}

/**
 * Update an existing ticket
 */
export async function updateTicket(
  ticketId: string,
  userId: string,
  updates: Partial<TicketDetails>
): Promise<{ ticket: TicketDetails | null; error: string | null }> {
  const supabase = await createClient();
  
  const { data: ticket, error } = await supabase
    .from('tickets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating ticket:', error);
    return { ticket: null, error: error.message };
  }
  
  return { ticket, error: null };
}

/**
 * Delete a ticket
 */
export async function deleteTicket(
  ticketId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting ticket:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, error: null };
}

/**
 * Get flight status (placeholder - would integrate with flight status API)
 */
export async function getFlightStatus(
  airlineCode: string,
  flightNumber: string,
  departureDate: string
): Promise<FlightStatus | null> {
  // This would integrate with a real flight status API like FlightAware or OpenFlights
  // For now, return a placeholder
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data based on current time vs departure time
    const now = new Date();
    const departure = new Date(departureDate);
    const timeDiff = departure.getTime() - now.getTime();
    
    let status: FlightStatus['status'];
    let delay_minutes: number | undefined;
    
    if (timeDiff < -2 * 60 * 60 * 1000) { // More than 2 hours ago
      status = 'departed';
    } else if (timeDiff < -30 * 60 * 1000) { // Departure time passed
      status = 'boarding';
    } else if (timeDiff < 60 * 60 * 1000) { // Within 1 hour
      status = 'boarding';
    } else {
      // Random delay status for demo
      status = Math.random() > 0.8 ? 'delayed' : 'on_time';
      if (status === 'delayed') {
        delay_minutes = Math.floor(Math.random() * 60) + 10;
      }
    }
    
    return {
      status,
      updated_time: new Date().toISOString(),
      delay_minutes,
      message: status === 'delayed' ? 
        `Flight is delayed by ${delay_minutes} minutes due to weather conditions.` : 
        undefined
    };
  } catch (error) {
    console.error('Error fetching flight status:', error);
    return null;
  }
}

/**
 * Create travel reminders for a ticket
 */
export async function createTravelReminders(ticketId: string): Promise<TravelReminder[]> {
  const supabase = await createClient();
  
  // Get ticket details
  const { data: ticket } = await supabase
    .from('tickets')
    .select('departure_datetime')
    .eq('id', ticketId)
    .single();
  
  if (!ticket || !ticket.departure_datetime) {
    throw new Error('Invalid ticket or missing departure time');
  }
  
  const departure = new Date(ticket.departure_datetime);
  
  // Create reminders for 72h, 24h, 3h before departure
  const reminders: Omit<TravelReminder, 'id' | 'created_at'>[] = [
    {
      ticket_id: ticketId,
      reminder_type: '72_hours',
      trigger_datetime: new Date(departure.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      message: 'Your flight departs in 72 hours. Please ensure all travel documents are ready.',
      is_sent: false,
    },
    {
      ticket_id: ticketId,
      reminder_type: '24_hours',
      trigger_datetime: new Date(departure.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      message: 'Your flight departs tomorrow. Check in online if possible.',
      is_sent: false,
    },
    {
      ticket_id: ticketId,
      reminder_type: '3_hours',
      trigger_datetime: new Date(departure.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      message: 'Your flight departs in 3 hours. Head to the airport soon.',
      is_sent: false,
    },
  ];
  
  // Insert reminders
  const { data: createdReminders, error } = await supabase
    .from('travel_reminders')
    .insert(reminders)
    .select();
  
  if (error) {
    console.error('Error creating travel reminders:', error);
    return [];
  }
  
  return createdReminders || [];
}

/**
 * Get travel reminders for a user
 */
export async function getUpcomingReminders(userId: string): Promise<TravelReminder[]> {
  const supabase = await createClient();
  
  const { data: reminders, error } = await supabase
    .from('travel_reminders')
    .select(`
      *,
      tickets!inner(user_id)
    `)
    .eq('tickets.user_id', userId)
    .eq('is_sent', false)
    .gte('trigger_datetime', new Date().toISOString())
    .order('trigger_datetime', { ascending: true });
  
  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }
  
  return reminders || [];
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(reminderId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('travel_reminders')
    .update({ is_sent: true })
    .eq('id', reminderId);
  
  if (error) {
    console.error('Error marking reminder as sent:', error);
    return false;
  }
  
  return true;
}
