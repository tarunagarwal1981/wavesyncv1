import { Suspense } from 'react';
import { getTickets, getTicketStats } from '@/lib/tickets/queries';
import { getCurrentUser } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Filter, 
  Calendar, 
  Plane, 
  TrendingUp,
  Clock,
  CalendarDays
} from 'lucide-react';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { SkeletonComponents } from '@/components/dashboard/SkeletonComponents';
import Link from 'next/link';

export default async function TicketsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Please log in to view tickets</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Travel & Tickets</h1>
          <p className="text-muted-foreground">
            Manage your flight bookings and travel documents
          </p>
        </div>
        
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/tickets/new">
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <StatsCards userId={user.id} />
      </Suspense>

      {/* Filters and Search */}
      <Suspense fallback={<div className="h-20 bg-muted animate-pulse rounded" />}>
        <TicketFilters />
      </Suspense>

      {/* Tickets List */}
      <Suspense fallback={<TicketsLoadingSkeleton />}>
        <TicketsList userId={user.id} />
      </Suspense>
    </div>
  );
}

async function StatsCards({ userId }: { userId: string }) {
  const stats = await getTicketStats(userId);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            All time bookings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <p className="text-xs text-muted-foreground">
            Confirmed travel
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">
            Past journeys
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Travel</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.nextTravel ? (
            <>
              <div className="text-lg font-bold">
                {stats.nextTravel.toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Days until departure
              </p>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-muted-foreground">No upcoming</div>
              <p className="text-xs text-muted-foreground">
                travel scheduled
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function TicketsList({ userId }: { userId: string }) {
  const [joiningTickets, signoffTickets] = await Promise.all([
    getTickets(userId, { 
      filters: { travel_purpose: 'joining', status: 'confirmed' },
      sort: { sort_by: 'departure_datetime', order: 'asc' }
    }),
    getTickets(userId, { 
      filters: { travel_purpose: 'signoff', status: 'confirmed' },
      sort: { sort_by: 'departure_datetime', order: 'asc' }
    })
  ]);

  const allTickets = await getTickets(userId, {
    filters: { status: 'confirmed' },
    sort: { sort_by: 'departure_datetime', order: 'asc' },
    limit: 10
  });

  if (allTickets.tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any travel bookings yet. Create your first booking to get started.
          </p>
          <Button asChild>
            <Link href="/tickets/new">
              <Plus className="h-4 w-4 mr-2" />
              Book Travel
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Travel */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Upcoming Travel</h2>
          <Badge variant="secondary">{allTickets.total}</Badge>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allTickets.tickets.slice(0, 6).map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket}
              variant="default"
            />
          ))}
        </div>
        
        {allTickets.tickets.length > 6 && (
          <div className="text-center mt-4">
            <Button variant="outline">View All Tickets</Button>
          </div>
        )}
      </section>

      {/* Joining Travel */}
      {joiningTickets.tickets.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Joining Assignments</h2>
                <Badge variant="outline">{joiningTickets.total}</Badge>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joiningTickets.tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

      {/* Sign-off Travel */}
      {signoffTickets.tickets.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Sign-off Travel</h2>
                <Badge variant="outline">{signoffTickets.total}</Badge>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signoffTickets.tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent History */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Recent History</h2>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {allTickets.tickets.slice(6).map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Plane className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{ticket.airline} {ticket.flight_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.departure_airport} → {ticket.arrival_airport}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs capitalize"
                      >
                        {ticket.travel_purpose.replace('_', ' ')}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonComponents.StatCard key={i} />
      ))}
    </div>
  );
}

function TicketsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonComponents.SectionCard>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonComponents.CertificateCard key={i} />
          ))}
        </div>
      </SkeletonComponents.SectionCard>
    </div>
  );
}