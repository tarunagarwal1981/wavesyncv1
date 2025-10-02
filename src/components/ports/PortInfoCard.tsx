import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  Globe, 
  Users, 
  Anchor, 
  Calendar,
  Navigation,
  Shoe,
  Shield,
  Heart,
  Download,
  Share2,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Port, FavoriteLocation } from '@/lib/ports/types';
import { 
  formatCoordinates, 
  getPortCurrentTime, 
  formatDistance,
  generateDirectionsUrl,
  getCurrencySymbol 
} from '@/lib/ports/utils';
'use client';

interface PortInfoCardProps {
  port: Port;
  userId?: string;
  favorites?: FavoriteLocation[];
  onToggleFavorite?: (port: Port) => void;
  onNavigate?: (port: Port) => void;
  className?: string;
}

export function PortInfoCard({
  port,
  userId,
  favorites = [],
  onToggleFavorite,
  onNavigate,
  className
}: PortInfoCardProps) {
  const currentTime = getPortCurrentTime(port.timezone);
  const isFavorite = favorites.some(fav => 
    fav.location_type === 'port' && fav.name === port.port_name
  );
  
  const getStatusColor = (status: Port['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getPortTypeColor = (portType: Port['port_type']) => {
    switch (portType) {
      case 'commercial': return 'border-blue-200 bg-blue-50';
      case 'industrial': return 'border-orange-200 bg-orange-50';
      case 'mixed': return 'border-purple-200 bg-purple-50';
      case 'marina': return 'border-cyan-200 bg-cyan-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{port.port_name}</CardTitle>
            </div>
            <p className="text-muted-foreground">
              {port.port_code} • {port.city}, {port.country}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge 
                className={cn('text-xs', getStatusColor(port.status))}
              >
                {port.status.replace('_', ' ')}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn('text-xs', getPortTypeColor(port.port_type))}
              >
                {port.port_type}
              </Badge>
              {port.continuous_operation && (
                <Badge variant="secondary" className="text-xs">
                  24h
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(port)}
                className={cn(
                  'h-8 w-8 p-0',
                  isFavorite ? 'text-red-500' : 'text-gray-400'
                )}
              >
                <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const directionsUrl = generateDirectionsUrl(
                  port.coordinates.latitude,
                  port.coordinates.longitude,
                  port.port_name
                );
                window.open(directionsUrl, '_blank');
              }}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Coordinates and Map */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatCoordinates(port.coordinates.latitude, port.coordinates.longitude)}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.(port)}
          >
            <Shoe className="h-4 w-4 mr-1" />
            Navigate
          </Button>
        </div>

        {/* Port Specifications */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Max Vessel Size</p>
            <p className="font-medium text-sm">{port.max_vessel_size}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Harbor Depth</p>
            <p className="font-medium text-sm">{port.harbor_depth}m</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Berths Available</p>
            <p className="font-medium text-sm">{port.berths_available}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Population</p>
            <p className="font-medium text-sm">{port.population?.toLocaleString() || 'N/A'}</p>
          </div>
        </div>

        {/* Local Time */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{currentTime.localTime}</p>
              <p className="text-xs text-muted-foreground">{currentTime.localDate}</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-xs">
              {port.timezone}
            </Badge>
          </div>
        </div>

        {/* Currency */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Local Currency:</span>
          <span className="font-medium text-sm">
            {port.currency} ({getCurrencySymbol(port.currency)})
          </span>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Local Languages:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {port.local_languages.map((lang => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Port Facilities:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {port.facilities.slice(0, 8).map(facility => (
              <Badge key={facility} variant="secondary" className="text-xs">
                {facility}
              </Badge>
            ))}
            {port.facilities.length > 8 && (
              <Badge variant="secondary" className="text-xs">
                +{port.facilities.length - 8} more
              </Badge>
            )}
          </div>
        </div>

        {/* Restrictions Alert */}
        {port.restrictions.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900 text-sm mb-1">Port Restrictions</p>
                <div className="space-y-1">
                  {port.restrictions.slice(0, 3).map((restriction => (
                    <p key={restriction} className="text-yellow-800 text-xs">
                      • {restriction}
                    </p>
                  ))}
                  {port.restrictions.length > 3 && (
                    <p className="text-yellow-700 text-xs">
                      +{port.restrictions.length - 3} more restrictions
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t md:flex-row flex-col">
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-1" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortMiniCard({ 
  port,
  onClick
}: { 
  port: Port;
  onClick?: () => void;
}) {
  const currentTime = getPortCurrentTime(port.timezone);

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">
              {port.port_name}
            </h4>
            <p className="text-xs text-muted-foreground">
              {port.port_code} • {port.city}, {port.country}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className="text-xs shrink-0 ml-2"
          >
            {port.port_type}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{currentTime.localTime}</span>
            <span className="text-muted-foreground">•</span>
            <span>{port.timezone}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">
              {formatCoordinates(port.coordinates.latitude, port.coordinates.longitude)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {port.berths_available} berths
            </span>
            <Badge 
              variant="secondary" 
              className="text-xs"
            >
              {port.currency}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
