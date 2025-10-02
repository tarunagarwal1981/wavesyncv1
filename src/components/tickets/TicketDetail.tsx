import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  FileText, 
  Download, 
  Share2, 
  Phone,
  Mail,
  Building,
  Plane,
  User,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TicketDetails, FlightStatus } from '@/lib/tickets/types';
import {
  formatDateTimeFromStatus,
  formatCurrencyFromStatus,
  getDepartureCountdownFromStatus,
  FlightStatusIndicator
} from '@/components/tickets/FlightStatusIndicator';
import { TravelChecklist } from './TravelChecklist';

interface TicketDetailProps {
  ticket: TicketDetails;
  flightStatus?: FlightStatus | null;
  isLoadingStatus?: boolean;
  onDownload?: (ticket: TicketDetails) => void;
  onShare?: (ticket: TicketDetails) => void;
  onContactAgent?: (ticket: TicketDetails) => void;
  className?: string;
}

export function TicketDetail({ 
  ticket, 
  flightStatus, 
  isLoadingStatus = false,
  onDownload, 
  onShare,
  onContactAgent,
  className 
}: TicketDetailProps) {
  const countdown = ticket.departure_datetime ? getDepartureCountdown(ticket.departure_datetime) : null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Status */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {ticket.airline} {ticket.flight_number}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {ticket.departure_airport} → {ticket.arrival_airport}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-sm',
                  flight.status === 'confirmed' ? 'border-green-300 text-green-700' :
                  flight.status === 'pending' ? 'border-yellow-300 text-yellow-700' :
                  flight.status === 'cancelled' ? 'border-red-300 text-red-700' :
                  'border-blue-300 text-blue-700'
                )}
              >
                {ticket.status}
              </Badge>
              
              {countdown && !countdown.expired && (
                <Badge 
                  variant={countdown.critical ? 'destructive' : 'secondary'}
                  className="text-sm"
                >
                  {countdown.value}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Flight Status */}
      {(flightStatus || isLoadingStatus) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Flight Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStatus ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading flight status...</span>
              </div>
            ) : flightStatus ? (
              <FlightStatusIndicator status={flightStatus} />
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Flight status unavailable</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Departure Information */}
      {ticket.departure_datetime && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Departure */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Departure</h3>
                    <p className="text-lg font-medium">{ticket.departure_airport}</p>
                  </div>
                </div>
                
                <div className="space-y-2 ml-13">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <span className="font-medium">
                      {formatDateTime(ticket.departure_datetime, { 
                        timeStyle: 'short',
                        includeTimezone: true 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {formatDateTime(ticket.departure_datetime, { 
                        dateStyle: 'long' 
                      })}
                    </span>
                  </div>
                  
                  {ticket.departure_terminal && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Terminal:</span>
                      <span className="font-medium">{ticket.departure_terminal}</span>
                    </div>
                  )}
                  
                  {ticket.departure_gate && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground ml-6">Gate:</span>
                      <span className="font-medium">{ticket.departure_gate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrival */}
              {ticket.arrival_datetime && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800">Arrival</h3>
                      <p className="text-lg font-medium">{ticket.arrival_airport}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-13">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Time:</span>
                      <span className="font-medium">
                        {formatDateTime(ticket.arrival_datetime, { 
                          timeStyle: 'short',
                          includeTimezone: true 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {formatDateTime(ticket.arrival_datetime, { 
                          dateStyle: 'long' 
                        })}
                      </span>
                    </div>
                    
                    {ticket.arrival_terminal && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Terminal:</span>
                        <span className="font-medium">{ticket.arrival_terminal}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Passenger Name</p>
              <p className="font-medium">John Doe</p> {/* This would come from user profile */}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Seat</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{ticket.seat_number || 'Not assigned'}</span>
                {ticket.seat_number && (
                  <Badge variant="outline" className="text-xs">
                    {ticket.class.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
              <p className="font-mono text-lg">{ticket.booking_reference}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Flight Class</p>
              <p className="font-medium capitalize">{ticket.class}</p>
            </div>
            
            {ticket.baggage_allowance && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Baggage Allowance</p>
                <p className="font-medium">{ticket.baggage_allowance}</p>
              </div>
            )}
            
            {ticket.meal_preference && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Meal Preference</p>
                <p className="font-medium">{ticket.meal_preference}</p>
              </div>
            )}
          </div>

          {ticket.special_requests && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
              <p className="text-sm">{ticket.special_requests}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Travel Documents & Checklist */}
      <TravelChecklist ticket={ticket} />

      {/* Contact Information */}
      {(ticket.booking_email || ticket.booking_phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Travel Agent Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ticket.booking_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{ticket.booking_email}</p>
                  </div>
                </div>
              )}
              
              {ticket.booking_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{ticket.booking_phone}</p>
                  </div>
                </div>
              )}
            </div>
            
            {onContactAgent && (
              <Button onClick={() => onContactAgent(ticket)} className="w-full md:w-auto">
                <Phone className="h-4 w-4 mr-2" />
                Contact Travel Agent
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {onDownload && ticket.document_url && (
              <Button 
                className="flex-1"
                onClick={() => onDownload(ticket)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download E-ticket
              </Button>
            )}
            
            {onShare && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onShare(ticket)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Details
              </Button>
            )}
            
            {/* Add to Calendar Button */}
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {/* Add calendar integration */}}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Important Travel Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Arrive at the airport at least 3 hours before international flights
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Check your passport validity and visa requirements for your destination
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Keep your booking reference number handy for check-in
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Download the airline's mobile app for real-time flight updates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
