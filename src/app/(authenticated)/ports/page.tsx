import { Suspense } from 'react';
import { getCurrentUser, redirect } from '@/lib/auth/session';
import { getTickets, getUpcomingTickets } from '@/lib/tickets/queries';
import { PortInfoCard, PortAgentCard, PortPracticalInfo, WeatherWidget } from '@/components/ports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Anchor, 
  Navigation,
  Clock,
  Phone,
  MapPin,
  RefreshCw,
  Download,
  Star,
  AlertCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default async function PortsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Port Information</h1>
          <p className="text-muted-foreground">
            Access port details, agents, and practical information
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Current Assignment Information */}
      <Suspense fallback={<CurrentAssignmentSkeleton />}>
        <CurrentAssignmentSection userId={user.id} />
      </Suspense>

      {/* Port Tabs or Sections */}
      <Suspense fallback={<PortsContentSkeleton />}>
        <PortsContent userId={user.id} />
      </Suspense>
    </div>
  );
}

async function CurrentAssignmentSection({ userId }: { userId: string }) {
  const tickets = await getUpcomingTickets(userId, 5);
  const nextJoiningTicket = tickets.find(ticket => ticket.travel_purpose === 'joining');
  const nextSignoffTicket = tickets.find(ticket => ticket.travel_purpose === 'signoff');

  // Mock port data - In real app, this would come from assignment data
  const mockPorts = {
    joining: {
      id: 'singapore-port',
      port_code: 'SGSIN',
      port_name: 'Singapore Port',
      country: 'Singapore',
      city: 'Singapore',
      port_type: 'commercial' as const,
      coordinates: {
        latitude: 1.2966,
        longitude: 103.7764
      },
      timezone: 'Asia/Singapore',
      currency: 'SGD',
      currency_symbol: 'S$',
      local_languages: ['English', 'Chinese', 'Malay', 'Tamil'],
      population: 5900000,
      continuous_operation: true,
      status: 'active' as const,
      facilities: ['Container Terminal', 'Fuel Services', 'Ship Repair', 'Maritime Services'],
      restrictions: ['No photography in restricted areas', 'Valid ID required'],
      health_protocols: ['COVID vaccination certificate', 'Health screening'],
      berths_available: 50,
      max_vessel_size: '500m LOA',
      harbor_depth: 16,
      created_at: '',
      updated_at: ''
    },
    signoff: {
      id: 'rotterdam-port',
      port_code: 'NLRTM',
      port_name: 'Port of Rotterdam',
      country: 'Netherlands',
      city: 'Rotterdam',
      port_type: 'commercial' as const,
      coordinates: {
        latitude: 51.9225,
        longitude: 4.47917
      },
      timezone: 'Europe/Amsterdam',
      currency: 'EUR',
      currency_symbol: '€',
      local_languages: ['Dutch', 'English'],
      population: 651446,
      continuous_operation: true,
      status: 'active' as const,
      facilities: ['Container Terminal', 'Bulk Terminal', 'Petrochemical Complex', 'Rail Services'],
      restrictions: [],
      health_protocols: ['Health insurance required'],
      berths_available: 200,
      max_vessel_size: '400m LOA',
      harbor_depth: 24,
      created_at: '',
      updated_at: ''
    }
  };

  if (!nextJoiningTicket && !nextSignoffTicket) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Anchor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Port Information Available</h3>
          <p className="text-muted-foreground mb-4">
            No upcoming travel assignments found. Your port information will appear here when you have confirmed travel plans.
          </p>
          <Button asChild>
            <Link href="/tickets">
              <Plus className="h-4 w-4 mr-2" />
              View Travel Tickets
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Joining Port */}
      {nextJoiningTicket && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Joining Assignment
              </Badge>
              <span>{mockPorts.joining.port_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <PortInfoCard port={mockPorts.joining} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <WeatherWidget 
                  portLat={mockPorts.joining.coordinates.latitude}
                  portLng={mockPorts.joining.coordinates.longitude}
                  portName={mockPorts.joining.port_name}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign-off Port */}
      {nextSignoffTicket && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Sign-off Assignment
              </Badge>
              <span>{mockPorts.signoff.port_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <PortInfoCard port={mockPorts.signoff} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <WeatherWidget 
                  portLat={mockPorts.signoff.coordinates.latitude}
                  portLng={mockPorts.signoff.coordinates.longitude}
                  portName={mockPorts.signoff.port_name}
                />
              </div>
            
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PortsContent({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <Anchor className="h-5 w-5" />
              <span>All Ports</span>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <MapPin className="h-5 w-5" />
              <span>Find Nearby</span>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <Phone className="h-5 w-5" />
              <span>Emergency Contacts</span>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 h-16">
              <Star className="h-5 w-5" />
              <span>Favorites</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Ports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mock recent ports */}
            {[
              { name: 'Singapore Port', code: 'SGSIN', country: 'Singapore' },
              { name: 'Port of Rotterdam', code: 'NLRTM', country: 'Netherlands' },
              { name: 'Hamburg Port', code: 'DEHAM', country: 'Germany' }
            ].map((port, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{port.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {port.code} • {port.country}
                    </p>
                  </div>
                  <Star className="h-4 w-4 text-muted-foreground hover:text-yellow-500 transition-colors" />
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Navigation className="h-3 w-3 mr-1" />
                    Navigate
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Updates */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="h-5 w-5" />
            Important Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              • Singapore Port: New health screening requirements effective immediately
            </p>
            <p className="text-sm text-blue-800">
              • Rotterdam Port: Container booking system upgrade scheduled for next week
            </p>
            <p className="text-sm text-blue-800">
              • General: All ports now require COVID vaccination certificates
            </p>
          </div>
          <Button variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100">
            Read More Updates
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CurrentAssignmentSkeleton() {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PortsContentSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
