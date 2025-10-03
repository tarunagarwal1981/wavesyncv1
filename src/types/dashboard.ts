export interface Assignment {
  id: string;
  user_id: string;
  vessel_id: string;
  join_date: string;
  expected_signoff_date: string;
  actual_signoff_date?: string;
  status: 'active' | 'completed' | 'cancelled';
  contract_reference?: string;
  created_at: string;
  updated_at: string;
  vessels: {
    vessel_name: string;
    vessel_type: string;
    imo_number: string;
    flag: string;
  };
}

export interface Certificate {
  id: string;
  user_id: string;
  certificate_type: string;
  certificate_name: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority?: string;
  certificate_number?: string;
  document_url?: string;
  status: 'valid' | 'expired' | 'pending_renewal';
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Circular {
  id: string;
  title: string;
  reference_number?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  issue_date: string;
  content: string;
  attachments?: string[];
  published_by: string;
  requires_acknowledgment: boolean;
  created_at: string;
}

export interface CircularAcknowledgment {
  id: string;
  circular_id: string;
  user_id: string;
  read_at?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  assignment_id?: string;
  ticket_type: 'flight' | 'ferry' | 'bus' | 'train';
  booking_reference?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_datetime?: string;
  arrival_datetime?: string;
  airline?: string;
  flight_number?: string;
  seat_number?: string;
  document_url?: string;
  created_at: string;
}

export interface SignoffChecklistItem {
  id: string;
  user_id: string;
  assignment_id?: string;
  item_text: string;
  category: string;
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  pendingTasks: number;
  expiringCertificates: number;
  unreadCirculars: number;
  upcomingTravel?: Date;
}

export interface UpcomingItem {
  id: string;
  type: 'certificate_expiry' | 'travel' | 'signoff' | 'assignment_reminder';
  title: string;
  description: string;
  date: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  link?: string;
}

export interface DashboardData {
  user: {
    id: string;
    email: string;
    profiles: {
      employee_id: string;
      rank: string;
      full_name?: string;
      nationality: string;
      phone?: string;
      avatar_url?: string;
    };
  };
  activeAssignment?: Assignment;
  stats: DashboardStats;
  upcomingItems: UpcomingItem[];
  recentCirculars: Array<Circular & { is_read: boolean }>;
  recentCertificates: Certificate[];
  recentTickets: Ticket[];
}


