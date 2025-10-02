import { createClient } from '@/lib/supabase/server';
import type { 
  DashboardData, 
  Assignment, 
  Certificate, 
  Circular,
  Ticket,
  SignoffChecklistItem,
  DashboardStats,
  UpcomingItem 
} from '@/types/dashboard';

interface DashboardServiceOptions {
  userId: string;
  limit?: number;
}

export async function getDashboardData({ userId, limit = 5 }: DashboardServiceOptions): Promise<DashboardData> {
  const supabase = await createClient();

  // Fetch all data in parallel for better performance
  const [
    userResult,
    assignmentsResult,
    certificatesResult,
    circularsResult,
    circularsAcknowledgmentResult,
    ticketsResult,
    checklistResult
  ] = await Promise.all([
    // Get user and profile data
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    
    // Get active assignments
    supabase
      .from('assignments')
      .select(`
        *,
        vessels (
          vessel_name,
          vessel_type,
          imo_number,
          flag
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1),
      
    // Get certificates with status
    supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('expiry_date', { ascending: true })
      .limit(10),
      
    // Get recent circulars
    supabase
      .from('circulars')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
      
    // Get circular acknowledgments to check read status
    supabase
      .from('circular_acknowledgments')
      .select('circular_id, read_at, acknowledged_at')
      .eq('user_id', userId),
      
    // Get recent tickets
    supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
      
    // Get signoff checklist items
    supabase
      .from('signoff_checklist_items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })
  ]);

  const { data: profile } = userResult;
  const { data: assignments = [] } = assignmentsResult;
  const { data: certificates = [] } = certificatesResult;
  const { data: circulars = [] } = circularsResult;
  const { data: acknowledgments = [] } = circularsAcknowledgmentResult;
  const { data: tickets = [] } = ticketsResult;
  const { data: checklist = [] } = checklistResult;

  const activeAssignment = assignments[0] as Assignment | undefined;

  // Calculate dashboard stats
  const stats = calculateDashboardStats({
    certificates,
    circulars,
    acknowledgments,
    checklist,
    tickets,
  });

  // Generate upcoming items
  const upcomingItems = generateUpcomingItems({
    assignment: activeAssignment,
    certificates,
    tickets,
  });

  // Combine circulars with read status
  const recentCirculars = circulars.map(circular => {
    const acknowledgment = acknowledgments.find(ack => ack.circular_id === circular.id);
    return {
      ...circular,
      is_read: !!acknowledgment?.read_at,
    };
  });

  return {
    user: {
      id: userId,
      email: '', // Will be filled from auth
      profiles: profile || {
        employee_id: '',
        rank: '',
        full_name: '',
        nationality: '',
        phone: '',
        avatar_url: '',
      },
    },
    activeAssignment,
    stats,
    upcomingItems,
    recentCirculars,
    recentCertificates: certificates.slice(0, limit),
    recentTickets: tickets.slice(0, limit),
  };
}

function calculateDashboardStats({
  certificates,
  circulars,
  acknowledgments,
  checklist,
  tickets,
}: {
  certificates: Certificate[];
  circulars: Circular[];
  acknowledgments: Array<{ circular_id: string; read_at?: string }>;
  checklist: SignoffChecklistItem[];
  tickets: Ticket[];
}): DashboardStats {
  // Count expiring certificates (within 90 days)
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  
  const expiringCertificates = certificates.filter(cert => {
    const expiryDate = new Date(cert.expiry_date);
    return expiryDate <= ninetyDaysFromNow && expiryDate > now;
  }).length;

  // Count unread circulars
  const unreadCirculars = circulars.filter(circular => {
    const acknowledgment = acknowledgments.find(ack => ack.circular_id === circular.id);
    return !acknowledgment?.read_at;
  }).length;

  // Find next travel date
  const upcomingTravel = tickets
    .filter(ticket => ticket.departure_datetime)
    .map(ticket => new Date(ticket.departure_datetime!))
    .filter(date => date > now)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return {
    pendingTasks: checklist.length,
    expiringCertificates,
    unreadCirculars,
    upcomingTravel,
  };
}

function generateUpcomingItems({
  assignment,
  certificates,
  tickets,
}: {
  assignment?: Assignment;
  certificates: Certificate[];
  tickets: Ticket[];
}): UpcomingItem[] {
  const items: UpcomingItem[] = [];
  const now = new Date();

  // Add certificate expiries (within 7 days)
  certificates
    .filter(cert => {
      const expiryDate = new Date(cert.expiry_date);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return expiryDate <= sevenDaysFromNow && expiryDate > now;
    })
    .forEach(cert => {
      items.push({
        id: `cert-${cert.id}`,
        type: 'certificate_expiry',
        title: 'Certificate Expiring Soon',
        description: `${cert.certificate_name} expires ${getRelativeDate(new Date(cert.expiry_date))}`,
        date: new Date(cert.expiry_date),
        priority: new Date(cert.expiry_date) <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) ? 'urgent' : 'high',
        link: '/dashboard/certificates',
      });
    });

  // Add upcoming travel
  tickets
    .filter(ticket => ticket.departure_datetime)
    .map(ticket => ({
      ...ticket,
      departureDate: new Date(ticket.departure_datetime!),
    }))
    .filter(ticket => ticket.departureDate > now)
    .sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime())
    .slice(0, 3)
    .forEach(ticket => {
      items.push({
        id: `ticket-${ticket.id}`,
        type: 'travel',
        title: 'Upcoming Travel',
        description: `Departure: ${ticket.departure_date?.toLocaleDateString()} (${ticket.airline || 'Flight'})`,
        date: ticket.departureDate,
        priority: 'medium',
        link: '/dashboard/tickets',
      });
    });

  // Add assignment sign-off if approaching
  if (assignment && assignment.expected_signoff_date) {
    const signoffDate = new Date(assignment.expected_signoff_date);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (signoffDate <= thirtyDaysFromNow && signoffDate > now) {
      items.push({
        id: `signoff-${assignment.id}`,
        type: 'signoff',
        title: 'Assignment Sign-off',
        description: `Expected sign-off: ${signoffDate.toLocaleDateString()}`,
        date: signoffDate,
        priority: 'high',
        link: '/dashboard/signoff',
      });
    }
  }

  // Sort by date and return top 5
  return items
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);
}

function getRelativeDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'tomorrow';
  if (diffInDays < 7) return `in ${diffInDays} days`;
  if (diffInDays < 30) return `in ${Math.ceil(diffInDays / 7)} weeks`;
  return `in ${Math.ceil(diffInDays / 30)} months`;
}

export async function getUserWithProfile(userId: string) {
  const supabase = await createClient();
  
  const { data: authUser } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return {
    user: authUser.user,
    profile,
  };
}
