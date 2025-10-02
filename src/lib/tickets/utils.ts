import type { TicketDetails, FlightSegment, TravelItinerary, AirportInfo, FlightStatus, TravelDocument } from './types';

/**
 * Format date and time in user's local timezone
 */
export function formatDateTime(dateString: string, options: {
  timezone?: string;
  dateStyle?: 'short' | 'medium' | 'long';
  timeStyle?: 'short' | 'medium';
  includeTimezone?: boolean;
} = {}): string {
  const { 
    timezone = 'local', 
    dateStyle = 'medium', 
    timeStyle = 'short',
    includeTimezone = false 
  } = options;

  const date = new Date(dateString);
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle,
    timeStyle,
  };

  if (includeTimezone) {
    formatOptions.timeZoneName = 'short';
  }

  if (timezone !== 'local') {
    formatOptions.timeZone = timezone;
  }

  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
}

/**
 * Calculate flight duration in minutes
 */
export function calculateFlightDuration(departureTime: string, arrivalTime: string): number {
  const dep = new Date(departureTime);
  const arr = new Date(arrivalTime);
  return Math.round((arr.getTime() - dep.getTime()) / (1000 * 60)); // minutes
}

/**
 * Format duration in hours and minutes
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * Calculate layover time between two flight segments
 */
export function calculateLayover(
  arrivalTime: string, 
  departureTime: string
): { duration: number; formatted: string } {
  const arrival = new Date(arrivalTime);
  const departure = new Date(departureTime);
  const duration = Math.round((departure.getTime() - arrival.getTime()) / (1000 * 60));
  
  return {
    duration,
    formatted: duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h ${duration % 60}m`
  };
}

/**
 * Get countdown to departure
 */
export function getDepartureCountdown(departureTime: string): {
  value: string;
  critical: boolean;
  expired: boolean;
} {
  const now = new Date();
  const departure = new Date(departureTime);
  const diffMs = departure.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { value: 'Departed', critical: false, expired: true };
  }
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  let value: string;
  if (diffDays > 0) {
    value = `${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    value = `${diffHours}h ${diffMinutes}m`;
  } else {
    value = `${diffMinutes}m`;
  }
  
  const critical = diffMs < 3 * 60 * 60 * 1000; // Less than 3 hours
  
  return { value, critical, expired: false };
}

/**
 * Get timezone abbreviation from airport code
 */
export function getAirportTimezone(airportCode: string): string {
  // This is a simplified mapping - in production, you'd want a comprehensive airport database
  const timezoneMap: Record<string, string> = {
    'LAX': 'America/Los_Angeles',
    'JFK': 'America/New_York',
    'LHR': 'Europe/London',
    'NRT': 'Asia/Tokyo',
    'DXB': 'Asia/Dubai',
    'SIN': 'Asia/Singapore',
    'FCO': 'Europe/Rome',
    'CDG': 'Europe/Paris',
    'MUC': 'Europe/Berlin',
    'ARN': 'Europe/Stockholm',
  };
  
  return timezoneMap[airportCode] || 'UTC';
}

/**
 * Convert UTC time to airport local time
 */
export function convertToAirportTime(
  utcTime: string, 
  airportCode: string
): { localTime: Date; formatted: string } {
  const timezone = getAirportTimezone(airportCode);
  const utc = new Date(utcTime);
  
  const localTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
  
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(utc);
  
  return { localTime, formatted };
}

/**
 * Generate QR code data for booking reference
 */
export function generateQRData(bookingReference: string, passengerName: string): string {
  return JSON.stringify({
    booking_reference: bookingReference,
    passenger_name: passengerName,
    timestamp: new Date().toISOString(),
    system: 'WaveSync'
  });
}

/**
 * Format money amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Generate calendar event data for a ticket
 */
export function generateCalendarEvent(ticket: TicketDetails): {
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  url?: string;
} {
  if (!ticket.departure_datetime || !ticket.arrival_datetime || !ticket.departure_airport || !ticket.arrival_airport) {
    throw new Error('Missing required ticket information for calendar event');
  }
  
  const title = `${ticket.airline} ${ticket.flight_number || ''} - ${ticket.travel_purpose}`
    .replace(/\s+/g, ' ').trim();
    
  const description = [
    `Travel Purpose: ${ticket.travel_purpose}`,
    `Booking Reference: ${ticket.booking_reference || 'N/A'}`,
    `Class: ${ticket.class}`,
    ticket.seat_number ? `Seat: ${ticket.seat_number}` : '',
    ticket.special_requests ? `Special Requests: ${ticket.special_requests}` : '',
    ticket.notes ? `Notes: ${ticket.notes}` : '',
  ].filter(Boolean).join('\n');
  
  const location = `${ticket.departure_airport} → ${ticket.arrival_airport}`;
  
  return {
    title,
    description,
    location,
    start: ticket.departure_datetime,
    end: ticket.arrival_datetime,
    url: ticket.document_url,
  };
}

/**
 * Get required travel documents for a ticket
 */
export function getRequiredDocuments(ticket: TicketDetails): TravelDocument[] {
  const baseDocuments: TravelDocument[] = [
    {
      type: 'passport',
      name: 'Passport',
      is_required: true,
      is_valid: false, // This would be checked against user's actual documents
    },
    {
      type: 'seaman_book',
      name: 'Seaman\'s Book',
      is_required: true,
      is_valid: false,
    },
  ];
  
  // Add travel-specific documents
  if (ticket.travel_purpose === 'joining') {
    baseDocuments.push(
      {
        type: 'visa',
        name: 'Work Visa (if required)',
        is_required: true,
        is_valid: false,
      },
      {
        type: 'medical_certificate',
        name: 'Medical Certificate',
        is_required: true,
        is_valid: false,
      }
    );
  }
  
  if (ticket.travel_purpose === 'signoff') {
    baseDocuments.push({
      type: 'visa',
      name: 'Flight Visa (if required)',
      is_required: false,
      is_valid: false,
    });
  }
  
  // Add yellow fever certificate for certain destinations
  const yellowFeverDestinations = ['AF', 'SA']; // Africa, South America codes
  const arrivalCountry = ticket.arrival_airport?.slice(-2); // Extract country code
  
  if (arrivalCountry && yellowFeverDestinations.includes(arrivalCountry)) {
    baseDocuments.push({
      type: 'yellow_fever',
      name: 'Yellow Fever Certificate',
      is_required: true,
      is_valid: false,
    });
  }
  
  return baseDocuments;
}

/**
 * Check if ticket requires immediate attention
 */
export function getTicketPriority(ticket: TicketDetails): 'low' | 'medium' | 'high' | 'urgent' {
  if (!ticket.departure_datetime) return 'medium';
  
  const now = new Date();
  const departure = new Date(ticket.departure_datetime);
  const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilDeparture < 3) return 'urgent';
  if (hoursUntilDeparture < 24) return 'high';
  if (hoursUntilDeparture < 72) return 'medium';
  return 'low';
}

/**
 * Format flight status
 */
export function formatFlightStatus(status: FlightStatus): {
  text: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  icon: string;
} {
  switch (status.status) {
    case 'on_time':
      return { text: 'On Time', color: 'green', icon: '✓' };
    case 'delayed':
      return { text: `Delayed ${status.delay_minutes}m`, color: 'yellow', icon: '⏰' };
    case 'cancelled':
      return { text: 'Cancelled', color: 'red', icon: '✕' };
    case 'boarding':
      return { text: 'Boarding', color: 'blue', icon: '🛫' };
    case 'departed':
      return { text: 'Departed', color: 'blue', icon: '✈️' };
    case 'arrived':
      return { text: 'Arrived', color: 'green', icon: '✓' };
    default:
      return { text: 'Unknown', color: 'gray', icon: '?' };
  }
}

/**
 * Calculate total travel time including layovers
 */
export function calculateTotalTravelTime(itinerary: TravelItinerary): number {
  if (itinerary.segments.length === 1) {
    return itinerary.segments[0].duration;
  }
  
  const flightTime = itinerary.segments.reduce((total, segment) => total + segment.duration, 0);
  const layoverTime = itinerary.segments.slice(0, -1).reduce((total, segment, index) => {
    if (segment.layover) {
      return total + segment.layover.duration;
    }
    return total;
  }, 0);
  
  return flightTime + layoverTime;
}

/**
 * Generate airport information summary
 */
export function generateAirportSummary(airportCode: string): AirportInfo {
  // Simplified airport info - in production, this would come from an API
  const airportData: Record<string, AirportInfo> = {
    'LAX': {
      code: 'LAX',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      country: 'United States',
      timezone: 'America/Los_Angeles',
      terminal_info: {
        terminal: 'Multiple',
        gates: ['Tom Bradley International Terminal', 'Continental Airlines Terminal'],
        amenities: ['WiFi', 'Restaurants', 'Shopping', 'Lounges'],
        check_in_time: '3 hours before departure'
      }
    },
    'JFK': {
      code: 'JFK',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      country: 'United States',
      timezone: 'America/New_York',
      terminal_info: {
        terminal: 'Multiple',
        gates: ['Terminal 1', 'Terminal 4', 'Terminal 5'],
        amenities: ['WiFi', 'Restaurants', 'Shopping', 'Lounges', 'Hotel'],
        check_in_time: '3 hours before departure'
      }
    },
  };
  
  return airportData[airportCode] || {
    code: airportCode,
    name: 'Unknown Airport',
    city: 'Unknown',
    country: 'Unknown',
    timezone: 'UTC',
  };
}
