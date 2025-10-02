import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  FileText,
  Phone,
  Mail,
  Building,
  Plane
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TicketDetails } from '@/lib/tickets/types';
import { 
  formatDateTime, 
  formatDuration, 
  calculateFlightDuration,
  generateCalendarEvent,
  generateQRData 
} from '@/lib/tickets/utils';

interface TravelItineraryProps {
  ticket: TicketDetails;
  className?: string;
}

export function TravelItinerary({ ticket, className }: TravelItineraryProps) {
  // Calculate total duration if we have both departure and arrival times
  const totalDuration = ticket.departure_datetime && ticket.arrival_datetime 
    ? calculateFlightDuration(ticket.departure_datetime, ticket.arrival_datetime)
    : null;

  // Generate calendar event data
  const calendarEvent = ticket.departure_datetime && ticket.arrival_datetime 
    ? generateCalendarEvent(ticket)
    : null;

  // Generate QR data if booking reference and passenger info exists
  const qrData = ticket.booking_reference ? 
    generateQRData(ticket.booking_reference, 'Passenger') : null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Flight Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Travel Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Route */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-lg font-semibold">{ticket.departure_airport}</p>
              <p className="text-sm text-muted-foreground">Departure</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-semibold">{ticket.arrival_airport}</p>
              <p className="text-sm text-muted-foreground">Arrival</p>
            </div>
          </div>

          {/* Flight Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant="outline" className="text-sm mb-2">
                {ticket.airline} {ticket.flight_number}
              </Badge>
              <p className="text-xs text-muted-foreground">Flight</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-sm mb-2">
                {ticket.class.toUpperCase()}
              </Badge>
              <p className="text-xs text-muted-foreground">Class</p>
            </div>
            <div className="text-center">
              {ticket.seat_number && (
                <>
                  <Badge variant="outline" className="text-sm mb-2">
                    {ticket.seat_number}
                  </Badge>
                  <p className="text-xs text-muted-foreground">Seat</p>
                </>
              )}
            </div>
          </div>

          {/* Duration */}
          {totalDuration && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Total flight time: {formatDuration(totalDuration)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Departure Details */}
      {ticket.departure_datetime && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Departure: {ticket.departure_airport}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Departure Time</p>
                <p className="font-medium">
                  {formatDateTime(ticket.departure_datetime, { 
                    dateStyle: 'long',
                    timeStyle: 'short',
                    includeTimezone: true 
                  })}
                </p>
              </div>
              
              {ticket.departure_terminal && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Terminal</p>
                  <p className="font-medium">{ticket.departure_terminal}</p>
                </div>
              )}
              
              {ticket.departure_gate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gate</p>
                  <p className="font-medium">{ticket.departure_gate}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Check-in</p>
                <p className="font-medium">3 hours before departure</p>
              </div>
            </div>

            {/* Special Requests */}
            {ticket.special_requests && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                <p className="text-sm">{ticket.special_requests}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Arrival Details */}
      {ticket.arrival_datetime && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Arrival: {ticket.arrival_airport}
            </CardTitle>
          </CardHeader>
      <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Arrival Time</p>
                <p className="font-medium">
                  {formatDateTime(ticket.arrival_datetime, { 
                    dateStyle: 'long',
                    timeStyle: 'short',
                    includeTimezone: true 
                  })}
                </p>
              </div>
              
              {ticket.arrival_terminal && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Terminal</p>
                  <p className="font-medium">{ticket.arrival_terminal}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Baggage Claim</p>
                <p className="font-medium">Follow signs from arrival gate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.booking_reference && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                <p className="font-mono text-lg">{ticket.booking_reference}</p>
              </div>
              {qrData && (
                <div className="text-center">
                  {/* In a real app, you'd render a QR code here */}
                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                    QR
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Scan for details</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Travel Purpose</p>
              <Badge variant="outline" className="capitalize">
                {ticket.travel_purpose.replace('_', ' ')}
              </Badge>
            </div>
            
            {ticket.ticket_price && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: ticket.currency || 'USD',
                  }).format(ticket.ticket_price)}
                </p>
              </div>
            )}
            
            {ticket.baggage_allowance && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Baggage</p>
                <p className="font-medium">{ticket.baggage_allowance}</p>
              </div>
            )}
            
            {ticket.meal_preference && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Meal</p>
                <p className="font-medium">{ticket.meal_preference}</p>
              </div>
            )}
          </div>

          {/* Travel Agent Contact */}
          {(ticket.booking_email || ticket.booking_phone) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-2">Travel Agent</p>
                  <div className="space-y-1">
                    {ticket.booking_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-blue-600" />
                        <span className="text-sm">{ticket.booking_email}</span>
                      </div>
                    )}
                    {ticket.booking_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-blue-600" />
                        <span className="text-sm">{ticket.booking_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {ticket.notes && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Additional Notes</p>
              <p className="text-sm">{ticket.notes}</p>
            </div>
          )}

          {/* Calendar Integration */}
          { calendarEvent && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 mb-2">Add to Calendar</p>
                  <p className="text-sm text-green-700 mb-3">
                    Keep track of your travel schedule
                  </p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      Google Calendar
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      Outlook
                    </button>
                    <button className="px-3 py-1 border border-green-600 text-green-600 text-sm rounded hover:bg-green-50">
                      Apple Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Import ArrowRight component
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12,5 19,12 12,19"></polyline>
    </svg>
  );
}
