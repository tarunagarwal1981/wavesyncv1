import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, 
  MapPin, 
  Clock, 
  Building,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlightSegment } from '@/lib/tickets/types';
import { formatDateTime, formatDuration, calculateLayover } from '@/lib/tickets/utils';

interface FlightTimelineProps {
  segments: FlightSegment[];
  className?: string;
}

export function FlightTimeline({ segments, className }: FlightTimelineProps) {
  if (segments.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No flight segments available</p>
        </CardContent>
      </Card>
    );
  }

  if (segments.length === 1) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Badge variant="outline" className="text-sm">
                Direct Flight
              </Badge>
            </div>
            
            <SingleSegment segment={segments[0]} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Badge variant="outline" className="text-sm">
              Connecting Flight • {segments.length} stops
            </Badge>
          </div>
          
          {segments.map((segment, index) => (
            <div key={segment.segment_number} className="relative">
              <MultiSegment 
                segment={segment} 
                isFirst={index === 0}
                isLast={index === segments.length - 1}
              />
              
              {/* Layover */}
              {index < segments.length - 1 && segment.layover && (
                <div className="mt-4 mb-4">
                  <LayoverInfo 
                    departure={segment.arrival_airport}
                    arrival={segments[index + 1].departure_airport}
                    layover={segment.layover}
                  />
                </div>
              )}
            </div>
          ))}
          
          {/* Total Duration */}
          <div className="pt-4 mt-6 border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Total Journey Time: {formatDuration(calculateTotalTime(segments))}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SingleSegment({ segment }: { segment: FlightSegment }) {
  return (
    <div className="relative">
      {/* Departure */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-green-700" />
          </div>
          <div>
            <p className="font-medium">{segment.departure_airport}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(segment.departure_datetime, { 
                timeStyle: 'short',
                includeTimezone: true 
              })}
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            {segment.airline} {segment.flight_number}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDuration(segment.duration)}
          </p>
        </div>
      </div>

      {/* Flight Path */}
      <div className="flex items-center justify-center my-4">
        <div className="flex-1 h-px bg-gradient-to-r from-green-300 to-blue-300"></div>
        <div className="mx-4">
          <Plane className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-green-300"></div>
      </div>

      {/* Arrival */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <p className="font-medium">{segment.arrival_airport}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(segment.arrival_datetime, { 
                timeStyle: 'short',
                includeTimezone: true 
              })}
            </p>
          </div>
        </div>
        
        {segment.aircraft_type && (
          <Badge variant="outline" className="text-xs">
            {segment.aircraft_type}
          </Badge>
        )}
      </div>
    </div>
  );
}

function MultiSegment({ 
  segment, 
  isFirst = false,
  isLast = false 
}: { 
  segment: FlightSegment; 
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const segmentNumber = isFirst ? '1st' : isLast ? `${segment.segment_number}th` : `${segment.segment_number}nd`;
  
  return (
    <div className="flex items-center gap-4">
      {/* Segment Indicator */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm',
          isFirst ? 'bg-green-500' : isLast ? 'bg-blue-500' : 'bg-gray-400'
        )}>
          {segment.segment_number}
        </div>
        {!isLast && (
          <div className="w-px h-8 bg-gray-300 mt-2"></div>
        )}
      </div>

      {/* Flight Details */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-medium text-sm">
              {segment.departure_airport} → {segment.arrival_airport}
            </p>
            <p className="text-xs text-muted-foreground">
              Segment {segmentNumber}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {segment.airline} {segment.flight_number}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Departure</p>
            <p className="font-medium">
              {formatDateTime(segment.departure_datetime, { 
                timeStyle: 'short',
                includeTimezone: true 
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Arrival</p>
            <p className="font-medium">
              {formatDateTime(segment.arrival_datetime, { 
                timeStyle: 'short',
                includeTimezone: true 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Duration: {formatDuration(segment.duration)}
            </span>
          </div>
          {segment.aircraft_type && (
            <Badge variant="secondary" className="text-xs">
              {segment.aircraft_type}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function LayoverInfo({ 
  departure, 
  arrival, 
  layover 
}: { 
  departure: string; 
  arrival: string; 
  layover: NonNullable<FlightSegment['layover']> 
}) {
  return (
    <div className={cn(
      'mx-6 p-4 rounded-lg border',
      layover.terminal_change 
        ? 'bg-yellow-50 border-yellow-200' 
        : 'bg-blue-50 border-blue-200'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className={cn(
            'h-5 w-5',
            layover.terminal_change ? 'text-yellow-600' : 'text-blue-600'
          )} />
          <div>
            <p className="font-medium text-sm">
              Layover at {layover.airport}
            </p>
            <p className="text-xs text-muted-foreground">
              {departure} → {arrival}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-medium text-sm">
            {formatDuration(layover.duration)}
          </p>
          {layover.terminal_change && (
            <p className="text-xs text-yellow-700 mt-1">
              Terminal Change Required
            </p>
          )}
        </div>
      </div>
      
      {layover.terminal_change && (
        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
          ⚠️ Please allow extra time - you'll need to transit between terminals
        </div>
      )}
    </div>
  );
}

function calculateTotalTime(segments: FlightSegment[]): number {
  return segments.reduce((total, segment) => {
    return total + segment.duration + (segment.layover?.duration || 0);
  }, 0);
}
