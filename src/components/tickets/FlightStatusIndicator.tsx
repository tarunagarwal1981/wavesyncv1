import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plane, 
  Wifi, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlightStatus } from '@/lib/tickets/types';
// import { formatDateTime } from '@/lib/tickets/utils'; // Using local version

interface FlightStatusIndicatorProps {
  status: FlightStatus;
}

export function FlightStatusIndicator({ status }: FlightStatusIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status.status) {
      case 'on_time':
        return {
          icon: CheckCircle,
          label: 'On Time',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Flight is running according to schedule',
        };
      
      case 'delayed':
        return {
          icon: Clock,
          label: 'Delayed',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          description: status.delay_minutes 
            ? `Flight is delayed by ${status.delay_minutes} minutes`
            : 'Flight is experiencing delays',
        };
      
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Cancelled',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          description: 'This flight has been cancelled',
        };
      
      case 'boarding':
        return {
          icon: Plane,
          label: 'Boarding',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'Passengers are now boarding the aircraft',
        };
      
      case 'departed':
        return {
          icon: Plane,
          label: 'Departed',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'Flight has departed from the gate',
        };
      
      case 'arrived':
        return {
          icon: CheckCircle,
          label: 'Arrived',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Flight has arrived at destination',
        };
      
      default:
        return {
          icon: AlertTriangle,
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          description: 'Flight status information unavailable',
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const IconComponent = statusDisplay.icon;

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border',
      statusDisplay.bgColor,
      statusDisplay.borderColor
    )}>
      <div className={cn('flex items-center gap-2', statusDisplay.color)}>
        <IconComponent className="h-5 w-5" />
        <span className="font-medium text-lg">{statusDisplay.label}</span>
      </div>
      
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          {statusDisplay.description}
        </p>
        
        {/* Additional Info */}
        <div className="mt-2 space-y-1">
          {status.delay_minutes && (
            <p className="text-sm">
              Delay: <span className="font-medium">{status.delay_minutes} minutes</span>
            </p>
          )}
          
          {status.gate_change && (
            <p className="text-sm">
              New Gate: <span className="font-medium">{status.gate_change}</span>
            </p>
          )}
          
          {status.estimated_departure && (
            <p className="text-sm">
              Estimated Departure: <span className="font-medium">
                {formatDateTimeFromStatus(status.estimated_departure, { 
                  timeStyle: 'short',
                  includeTimezone: true 
                })}
              </span>
            </p>
          )}
          
          {status.estimated_arrival && (
            <p className="text-sm">
              Estimated Arrival: <span className="font-medium">
                {formatDateTimeFromStatus(status.estimated_arrival, { 
                  timeStyle: 'short',
                  includeTimezone: true 
                })}
              </span>
            </p>
          )}
          
          {status.message && (
            <p className="text-sm mt-2 p-2 bg-white/60 rounded border">
              {status.message}
            </p>
          )}
        </div>
        
        {/* Last Updated */}
        <p className="text-xs text-muted-foreground mt-3">
          Last updated: {formatDateTimeFromStatus(status.updated_time, { 
            dateStyle: 'short',
            timeStyle: 'short' 
          })}
        </p>
      </div>
      
      {/* Status Badge */}
      <Badge 
        variant="outline" 
        className={cn(
          'text-xs',
          status.status === 'on_time' ? 'border-green-300 text-green-700' :
          status.status === 'delayed' ? 'border-yellow-300 text-yellow-700' :
          status.status === 'cancelled' ? 'border-red-300 text-red-700' :
          'border-blue-300 text-blue-700'
        )}
      >
        {status.status.replace('_', ' ').toUpperCase()}
      </Badge>
    </div>
  );
}

/**
 * Format date and time with options
 */
export function formatDateTimeFromStatus(date: string | Date, options?: {
  dateStyle?: 'short' | 'medium' | 'long';
  timeStyle?: 'short' | 'medium' | 'long';
  includeTimezone?: boolean;
}): string {
  const targetDate = new Date(date);
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: options?.dateStyle || 'short',
    timeStyle: options?.timeStyle || 'short',
    timeZone: options?.includeTimezone ? 'UTC' : undefined,
  });
  
  return dateFormatter.format(targetDate);
}

/**
 * Format currency value
 */
export function formatCurrencyFromStatus(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Get time until departure
 */
export function getDepartureCountdownFromStatus(departureTime: string | Date): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  formatted: string;
} {
  const departure = new Date(departureTime);
  const now = new Date();
  const diffMs = departure.getTime() - now.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    hours,
    minutes,
    totalMinutes,
    formatted: `${hours}h ${minutes}m`
  };
}

export function FlightStatusCard({ status }: { status: FlightStatus }) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Real-time Status</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3" />
            Live
          </div>
        </div>
        <FlightStatusIndicator status={status} />
      </div>
    </Card>
  );
}
