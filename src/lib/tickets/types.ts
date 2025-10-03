export interface TicketDetails {
  id: string;
  user_id: string;
  assignment_id?: string;
  ticket_type: 'flight' | 'ferry' | 'bus' | 'train';
  booking_reference?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  travel_purpose: 'joining' | 'signoff' | 'shore_leave' | 'training';
  
  // Departure details
  departure_airport?: string;
  departure_terminal?: string;
  departure_gate?: string;
  departure_datetime?: string;
  
  // Arrival details
  arrival_airport?: string;
  arrival_terminal?: string;
  arrival_datetime?: string;
  
  // Travel details
  airline?: string;
  flight_number?: string;
  aircraft_type?: string;
  seat_number?: string;
  class: 'economy' | 'business' | 'first' | 'premium';
  
  // Booking details
  ticket_price?: number;
  currency?: string;
  booking_agent?: string;
  booking_email?: string;
  booking_phone?: string;
  
  // Documents
  document_url?: string;
  boarding_pass_url?: string;
  confirmation_email?: string;
  
  // Additional info
  baggage_allowance?: string;
  meal_preference?: string;
  special_requests?: string;
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface FlightSegment {
  segment_number: number;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime: string;
  arrival_datetime: string;
  airline: string;
  flight_number: string;
  aircraft_type?: string;
  duration: number; // in minutes
  layover?: {
    airport: string;
    duration: number; // in minutes
    terminal_change?: boolean;
  };
}

export interface TravelItinerary {
  ticket_id: string;
  segments: FlightSegment[];
  total_duration: number; // in minutes
  total_distance?: number; // in kilometers
  timezone_offset: number; // minutes from UTC
}

export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  terminal_info?: {
    terminal: string;
    gates: string[];
    amenities: string[];
    check_in_time: string;
  };
}

export interface TravelDocument {
  type: 'passport' | 'seaman_book' | 'visa' | 'medical_certificate' | 'yellow_fever' | 'other';
  name: string;
  number?: string;
  expiry_date?: string;
  is_required: boolean;
  is_valid: boolean;
  notes?: string;
}

export interface TicketFilters {
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'all';
  ticket_type?: 'flight' | 'ferry' | 'bus' | 'train' | 'all';
  travel_purpose?: 'joining' | 'signoff' | 'shore_leave' | 'training' | 'all';
  date_from?: string;
  date_to?: string;
  airline?: string;
  search_term?: string;
}

export interface TicketSortOptions {
  sort_by: 'departure_datetime' | 'created_at' | 'airline' | 'status';
  order: 'asc' | 'desc';
}

export interface FlightStatus {
  status: 'on_time' | 'delayed' | 'cancelled' | 'boarding' | 'departed' | 'arrived';
  updated_time: string;
  delay_minutes?: number;
  gate_change?: string;
  estimated_departure?: string;
  estimated_arrival?: string;
  message?: string;
}

export interface TravelReminder {
  id: string;
  ticket_id: string;
  reminder_type: '72_hours' | '24_hours' | '3_hours' | 'boarding_time';
  trigger_datetime: string;
  message: string;
  is_sent: boolean;
  created_at: string;
}

export interface TicketBooking extends TicketDetails {
  passenger_details?: {
    first_name: string;
    last_name: string;
    passport_number?: string;
    phone?: string;
    email?: string;
  };
  travel_category: 'crew_transfer' | 'personal' | 'emergency';
  budget_code?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
}



