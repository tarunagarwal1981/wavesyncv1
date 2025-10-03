import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Plane, 
  MapPin, 
  Clock, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Building,
  User,
  FileText,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TicketDetails } from '@/lib/tickets/types';
import { 
  formatDateTime, 
  getDepartureCountdown, 
  formatCurrency,
  getTicketPriority 
} from '@/lib/tickets/utils';

interface TicketCardProps {
  ticket: TicketDetails;
  variant?: 'default' | 'compact' | 'detailed';
  onView?: (ticket: TicketDetails) => void;
  onEdit?: (ticket: TicketDetails) => void;
  onDelete?: (ticket: TicketDetails) => void;
  onDownload?: (ticket: TicketDetails) => void;
  className?: string;
}

export function TicketCard({
  ticket,
  variant = 'default',
  onView,
  onEdit,
  onDelete,
  onDownload,
  className
}: TicketCardProps) {
  const countdown = ticket.departure_datetime ? getDepartureCountdown(ticket.departure_datetime) : null;
  const priority = getTicketPriority(ticket);
  
  const actions = [
    { icon: Eye, label: 'View', onClick: () => onView?.(ticket) },
    { icon: Edit, label: 'Edit', onClick: () => onEdit?.(ticket) },
    { icon: Download, label: 'Download', onClick: () => onDownload?.(ticket) },
    { icon: Trash2, label: 'Delete', onClick: () => onDelete?.(ticket), variant: 'destructive' as const },
  ].filter(action => action.onClick);

  const getStatusColor = (status: TicketDetails['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {ticket.airline} {ticket.flight_number}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {ticket.departure_airport} → {ticket.arrival_airport}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', getStatusColor(ticket.status))}>
                {ticket.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onView?.(ticket)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">
                {ticket.airline} {ticket.flight_number}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {ticket.ticket_type.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {ticket.travel_purpose.replace('_', ' ')}
                </Badge>
                {countdown && (
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', countdown.critical ? 'border-red-300 text-red-700' : '')}
                  >
                    {countdown.expired ? countdown.value : `${countdown.value} left`}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={cn('text-xs', getStatusColor(ticket.status))}>
              {ticket.status}
            </Badge>
            <Badge className={cn('text-xs', getPriorityColor(priority))}>
              {priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Flight Route */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{ticket.departure_airport}</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium text-sm">{ticket.arrival_airport}</span>
          </div>
          {ticket.seat_number && (
            <Badge variant="secondary" className="text-xs">
              Seat {ticket.seat_number}
            </Badge>
          )}
        </div>

        {/* Departure Info */}
        {ticket.departure_datetime && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Departure:</span>
            <span>{formatDateTime(ticket.departure_datetime, { 
              dateStyle: 'medium', 
              timeStyle: 'short',
              includeTimezone: true 
            })}</span>
          </div>
        )}

        {/* Arrival Info */}
        {ticket.arrival_datetime && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Arrival:</span>
            <span>{formatDateTime(ticket.arrival_datetime, { 
              dateStyle: 'medium', 
              timeStyle: 'short',
              includeTimezone: true 
            })}</span>
          </div>
        )}

        {/* Booking Reference & Class */}
        {ticket.booking_reference && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Booking:</span>
            <span className="font-mono text-xs">{ticket.booking_reference}</span>
            <span className="text-muted-foreground">•</span>
            <span className="capitalize">{ticket.class}</span>
          </div>
        )}

        {/* Price */}
        {ticket.ticket_price && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Cost:</span>
            <span className="font-medium">{formatCurrency(ticket.ticket_price, ticket.currency)}</span>
          </div>
        )}

        {/* Terminal & Gate Info */}
        {(ticket.departure_terminal || ticket.departure_gate) && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Departure: {ticket.departure_terminal}
              {ticket.departure_gate && ` Gate ${ticket.departure_gate}`}
            </span>
          </div>
        )}

        {/* Travel Agent Contact */}
        {ticket.booking_phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Agent:</span>
            <span>{ticket.booking_email || 'Contact via phone'}</span>
          </div>
        )}

        {/* Documents Preview */}
        {ticket.document_url && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              E-ticket available
            </span>
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 px-2"
                onClick={() => onDownload(ticket)}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        )}

        {/* Countdown Warning */}
        {countdown && countdown.critical && !countdown.expired && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Departure Soon!</span>
              <span>{countdown.value}</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Please ensure you're at the airport and ready for boarding.
            </p>
          </div>
        )}

        {/* Actions */}
        {variant === 'detailed' && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={action.onClick}
                >
                  <IconComponent className="h-3 w-3" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Quick Actions for Default Variant */}
        {variant === 'default' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView?.(ticket)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            {onDownload && ticket.document_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(ticket)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TicketGridItem({ 
  ticket,
  onClick
}: {
  ticket: TicketDetails;
  onClick?: () => void;
}) {
  const countdown = ticket.departure_datetime ? getDepartureCountdown(ticket.departure_datetime) : null;

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Plane className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <Badge 
              variant="outline" 
              className="text-xs capitalize"
            >
              {ticket.status}
            </Badge>
            {countdown && !countdown.expired && (
              <Badge 
                variant="outline" 
                className={cn('text-xs', countdown.critical ? 'border-red-300 text-red-700' : '')}
              >
                {countdown.value}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm line-clamp-2">
            {ticket.airline} {ticket.flight_number}
          </h4>
          <p className="text-xs text-muted-foreground">
            {ticket.departure_airport} → {ticket.arrival_airport}
          </p>
          <div className="flex items-center justify-between text-xs">
            <Badge variant="secondary" className="text-xs">
              {ticket.travel_purpose.replace('_', ' ')}
            </Badge>
            <span className="text-muted-foreground capitalize">
              {ticket.class}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



