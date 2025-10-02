import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getTicketById, getFlightStatus } from '@/lib/tickets/queries';
import { getCurrentUser } from '@/lib/auth/session';
import { TicketDetail } from '@/components/tickets/TicketDetail';
import { TravelItinerary } from '@/components/tickets/TravelItinerary';
import { FlightTimeline } from '@/components/tickets/FlightTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Phone,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import type { FlightSegment } from '@/lib/tickets/types';

interface TicketDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const ticket = await getTicketById(params.id, user.id);

  if (!ticket) {
    notFound();
  }

  // Generate mock flight segments for timeline (in real app, this would come from ticket data)
  const flightSegments: FlightSegment[] = ticket.departure_datetime && ticket.arrival_datetime ? [
    {
      segment_number: 1,
      departure_airport: ticket.departure_airport || '',
      arrival_airport: ticket.arrival_airport || '',
      departure_datetime: ticket.departure_datetime,
      arrival_datetime: ticket.arrival_datetime,
      airline: ticket.airline || '',
      flight_number: ticket.flight_number || '',
      aircraft_type: 'Boeing 777',
      duration: 420, // 7 hours in minutes
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tickets">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tickets
              </Link>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {ticket.airline} {ticket.flight_number}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {ticket.departure_airport} → {ticket.arrival_airport}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Refresh flight status
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Ticket Status Alert */}
      {ticket.status === 'pending' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="font-medium">Booking Confirmation Pending</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Your booking is being confirmed. You'll receive an email once confirmed.
            </p>
          </CardContent>
        </Card>
      )}

      {ticket.status === 'cancelled' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">Flight Cancelled</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              This flight has been cancelled. Please contact your travel agent for rebooking.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded" />}>
            <TicketDetailCard 
              ticket={ticket}
              onDownload={(ticket) => {
                // Handle download
                console.log('Download ticket:', ticket.id);
              }}
              onShare={(ticket) => {
                // Handle share
                console.log('Share ticket:', ticket.id);
              }}
              onContactAgent={(ticket) => {
                // Handle contact agent
                console.log('Contact agent for:', ticket.id);
              }}
            />
          </Suspense>

          {/* Flight Timeline */}
          {flightSegments.length > 0 && (
            <FlightTimeline segments={flightSegments} />
          )}

          {/* Travel Itinerary */}
          <TravelItinerary ticket={ticket} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Flight Status */}
          <Suspense fallback={<FlightStatusSkeleton />}>
            <FlightStatusSection ticket={ticket} />
          </Suspense>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              
              {ticket.document_url && (
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download E-ticket
                </Button>
              )}
              
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Boarding Pass
              </Button>
              
              {(ticket.booking_phone || ticket.booking_email) && (
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Agent
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-mono text-sm">{ticket.booking_reference}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Travel Purpose</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {ticket.travel_purpose.replace('_', ' ')}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="text-sm capitalize">{ticket.class}</p>
              </div>
              
              {ticket.seat_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Seat</p>
                  <p className="text-sm">{ticket.seat_number}</p>
                </div>
              )}
              
              {ticket.ticket_price && (
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: ticket.currency || 'USD',
                    }).format(ticket.ticket_price)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passport & Visa Reminder */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">Travel Reminders</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Check passport validity</p>
                <p>• Verify visa requirements</p>
                <p>• Print boarding pass</p>
                <p>• Arrive 3 hours early</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

async function TicketDetailCard({ 
  ticket,
  onDownload,
  onShare,
  onContactAgent
}: { 
  ticket: any;
  onDownload: (ticket: any) => void;
  onShare: (ticket: any) => void;
  onContactAgent: (ticket: any) => void;
}) {
  // Get flight status for this ticket
  let flightStatus = null;
  let isLoadingStatus = false;

  if (ticket.flight_number && ticket.departure_datetime) {
    try {
      isLoadingStatus = true;
      flightStatus = await getFlightStatus(
        ticket.airline || 'Unknown',
        ticket.flight_number,
        ticket.departure_datetime
      );
      isLoadingStatus = false;
    } catch (error) {
      console.error('Error fetching flight status:', error);
      isLoadingStatus = false;
    }
  }

  return (
    <TicketDetail
      ticket={ticket}
      flightStatus={flightStatus}
      isLoadingStatus={isLoadingStatus}
      onDownload={onDownload}
      onShare={onShare}
      onContactAgent={onContactAgent}
    />
  );
}

async function FlightStatusSection({ ticket }: { ticket: any }) {
  if (!ticket.flight_number || !ticket.departure_datetime) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Flight Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Flight status unavailable for this ticket type.
          </p>
        </CardContent>
      </Card>
    );
  }

  try {
    const flightStatus = await getFlightStatus(
      ticket.airline || 'Unknown',
      ticket.flight_number,
      ticket.departure_datetime
    );

    if (!flightStatus) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Flight Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Unable to fetch flight status at this time.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Flight Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center gap-2 mb-2 ${
            flightStatus.status === 'on_time' ? 'text-green-600' :
            flightStatus.status === 'delayed' ? 'text-yellow-600' :
            flightStatus.status === 'cancelled' ? 'text-red-600' :
            'text-blue-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              flightStatus.status === 'on_time' ? 'bg-green-500' :
              flightStatus.status === 'delayed' ? 'bg-yellow-500' :
              flightStatus.status === 'cancelled' ? 'bg-red-500' :
              'bg-blue-500'
            }`} />
            <span className="font-medium capitalize">
              {flightStatus.status.replace('_', ' ')}
            </span>
          </div>
          
          {flightStatus.delay_minutes && (
            <p className="text-sm text-muted-foreground mb-2">
              Delayed by {flightStatus.delay_minutes} minutes
            </p>
          )}
          
          {flightStatus.estimated_departure && (
            <p className="text-sm">
              <span className="text-muted-foreground">ETA:</span>
              <span className="ml-1 font-medium">
                {new Date(flightStatus.estimated_departure).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </p>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(flightStatus.updated_time).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching flight status:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Flight Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Error loading flight status.
          </p>
        </CardContent>
      </Card>
    );
  }
}

function FlightStatusSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Flight Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-1/3"></div>
        </div>
      </CardContent>
    </Card>
  );
}
