'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Office,
  Star,
  Languages,
  Award,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortAgent } from '@/lib/ports/types';
import { formatLocalTime } from '@/lib/ports/utils';

interface PortAgentCardProps {
  agent: PortAgent;
  portTimezone: string;
  className?: string;
}

export function PortAgentCard({ agent, portTimezone, className }: PortAgentCardProps) {
  const currentHour = new Date().getHours();
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof typeof agent.operating_hours;
  const todayHours = agent.operating_hours[currentDay];
  
  const isOpen = todayHours.is_closed ? false : 
    !todayHours.open_time || !todayHours.close_time ? true :
    currentHour >= parseInt(todayHours.open_time.split(':')[0]) && 
    currentHour <= parseInt(todayHours.close_time.split(':')[0]);

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleWebsite = (url: string) => {
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    window.open(url, '_blank');
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Office className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{agent.agent_name}</CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">
              {agent.company_name}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {agent.is_main_agent && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Main Agent
                </Badge>
              )}
              
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-xs border',
                isOpen 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              )}>
                <div className="w-2 h-2 rounded-full bg-current" />
                {isOpen ? 'Open Now' : 'Closed'}
              </div>
            </div>
          </div>
          
          {agent.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{agent.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          {agent.phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{agent.phone}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePhoneCall(agent.phone)}
                className="flex items-center gap-1"
              >
                <Phone className="h-3 w-3" />
                Call
              </Button>
            </div>
          )}
          
          {agent.mobile_phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{agent.mobile_phone}</span>
                <Badge variant="outline" className="text-xs">Mobile</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePhoneCall(agent.mobile_phone)}
                className="flex items-center gap-1"
              >
                Call
              </Button>
            </div>
          )}
          
          {agent.email && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{agent.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEmail(agent.email)}
                className="flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                Email
              </Button>
            </div>
          )}
          
          {agent.website && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{agent.website}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWebsite(agent.website)}
                className="flex items-center gap-1"
              >
                <Globe className="h-3 w-3" />
                Visit
              </Button>
            </div>
          )}
          
          {agent.fax && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{agent.fax}</span>
              <Badge variant="outline" className="text-xs">Fax</Badge>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Address</p>
          <p className="text-sm text-muted-foreground">{agent.address}</p>
        </div>

        {/* Operating Hours */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Operating Hours</p>
          </div>
          
          <div className="space-y-1">
            {Object.entries(agent.operating_hours).map(([day, hours]) => {
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);
              const isToday = day === currentDay;
              
              return (
                <div 
                  key={day} 
                  className={cn(
                    'flex items-center justify-between text-xs px-2 py-1 rounded',
                    isToday && 'bg-primary/10'
                  )}
                >
                  <span className={cn(isToday && 'font-medium')}>{dayName}</span>
                  <span className={cn(
                    'text-muted-foreground',
                    hours.is_closed ? 'text-red-500' : 'text-green-600'
                  )}>
                    {hours.is_closed 
                      ? 'Closed' 
                      : hours.open_time && hours.close_time
                        ? `${formatTime(hours.open_time)} - ${formatTime(hours.close_time)}`
                        : 'Open'
                    }
                  </span>
                </div>
              );
            })}
          </div>
          
          {todayHours.notes && (
            <p className="text-xs text-muted-foreground italic">
              {todayHours.notes}
            </p>
          )}
        </div>

        {/* Languages Spoken */}
        {agent.languages_spoken.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Languages</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {(agent.languages_spoken || []).map(lang => (
                <Badge key={lang} variant="secondary" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {agent.services.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Services</p>
            <div className="flex flex-wrap gap-1">
              {agent.services.map(service => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {agent.specialties.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Specialties</p>
            <div className="flex flex-wrap gap-1">
              {agent.agent.specialties.map(specialty => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {agent.emergency_contact && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900 text-sm mb-1">Emergency Contact</p>
                <div className="flex items-center gap-2">
                  <span className="text-red-800 text-sm">{agent.emergency_contact}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                    onClick={() => handlePhoneCall(agent.emergency_contact)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {agent.notes && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{agent.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}
