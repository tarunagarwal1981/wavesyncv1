'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShoppingBag,
  Utensils,
  Heart,
  CreditCard,
  Wifi,
  Pill,
  Car,
  Bus,
  Train,
  Ship,
  AlertTriangle,
  Shield,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortPracticalInfo } from '@/lib/ports/types';
import { useState } from 'react';

interface PortPracticalInfoProps {
  practicalInfo: PortPracticalInfo;
  className?: string;
}

export function PortPracticalInfo({ practicalInfo, className }: PortPracticalInfoProps) {
  const [activeTab, setActiveTab] = useState<'transport' | 'facilities' | 'services'>('transport');

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Practical Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Emergency Contacts */}
        <div className="space-y-3">
          <h4 className="font-medium text-lg">Emergency Contacts</h4>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Emergency</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePhoneCall(practicalInfo.local_emergency_number)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {practicalInfo.local_emergency_number}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Police</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePhoneCall(practicalInfo.police_number)}
              >
                Call
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Hospital</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePhoneCall(practicalInfo.hospital_number)}
              >
                Call
              </Button>
            </div>
            
            {practicalInfo.embassy_contact && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Embassy</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePhoneCall(practicalInfo.embassy_contact)}
                >
                  Call
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('transport')}
            className={cn(
              'flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              activeTab === 'transport'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Car className="h-4 w-4" />
            Transport
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={cn(
              'flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              activeTab === 'facilities'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            Facilities
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={cn(
              'flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              activeTab === 'services'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="h-4 w-4" />
            Services
          </button>
        </div>

        {/* Transport Tab */}
        {activeTab === 'transport' && (
          <div className="space-y-4">
            <h4 className="font-medium">Local Transport</h4>
            
            {/* Taxi Companies */}
            {practicalInfo.local_transport.taxi_companies.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Taxi Companies</span>
                </div>
                <div className="space-y-2">
                  {practicalInfo.local_transport.taxi_companies.map((taxi, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{taxi.name}</p>
                        {taxi.operating_24h && (
                          <Badge variant="outline" className="text-xs">24h</Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePhoneCall(taxi.phone)}
                      >
                        {taxi.phone}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Public Transport */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                
                <Bus className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Public Transport</span>
                
              </div>
              
              {practicalInfo.local_transport.bus_routes.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bus Routes:</p>
                  <div className="flex flex-wrap gap-1">
                    {practicalInfo.local_transport.bus_routes.map((route, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {practicalInfo.local_transport.railway_station && (
                <div className="flex items-center gap-2">
                  <Train className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Railway:</span>
                  <span className="text-sm font-medium">{practicalInfo.local_transport.railway_station}</span>
                </div>
              )}
              
              {practicalInfo.local_transport.metro_station && (
                <div className="flex items-center gap-2">
                  <Train className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Metro:</span>
                  <span className="text-sm font-medium">{practicalInfo.local_transport.metro_station}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Facilities Tab */}
        {activeTab === 'facilities' && (
          <div className="space-y-4">
            <h4 className="font-medium">Local Facilities</h4>
            
            {/* Shopping */}
            {practicalInfo.local_facilities.shopping_centers.length > 0 && (
              <FacilitySection
                title="Shopping Centers"
                icon={ShoppingBag}
                facilities={practicalInfo.local_facilities.shopping_centers}
              />
            )}
            
            {/* Restaurants */}
            {practicalInfo.local_facilities.restaurants.length > 0 && (
              <FacilitySection
                title="Restaurants"
                icon={Utensils}
                facilities={practicalInfo.local_facilities.restaurants}
              />
            )}
            
            {/* Medical */}
            {practicalInfo.local_facilities.medical_clinics.length > 0 && (
              <FacilitySection
                title="Medical Clinics"
                icon={Heart}
                facilities={practicalInfo.local_facilities.medical_clinics}
              />
            )}
            
            {/* Banks */}
            {practicalInfo.local_facilities.banks_atms.length > 0 && (
              <FacilitySection
                title="Banks & ATMs"
                icon={CreditCard}
                facilities={practicalInfo.local_facilities.banks_atms}
              />
            )}
            
            {/* Internet */}
            {practicalInfo.local_facilities.internet_cafes.length > 0 && (
              <FacilitySection
                title="Internet Cafes"
                icon={Wifi}
                facilities={practicalInfo.local_facilities.internet_cafes}
              />
            )}
            
            {/* Pharmacies */}
            {practicalInfo.local_facilities.pharmacies.length > 0 && (
              <FacilitySection
                title="Pharmacies"
                icon={Pill}
                facilities={practicalInfo.local_facilities.pharmacies}
              />
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Customs */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Customs Office
              </h4>
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">Office Hours</p>
                <p className="text-sm font-medium">
                  {practicalInfo.customs_info.office_hours.is_closed ? 'Closed' :
                   practicalInfo.customs_info.office_hours.open_time && practicalInfo.customs_info.office_hours.close_time
                     ? `${practicalInfo.customs_info.office_hours.open_time} - ${practicalInfo.customs_info.office_hours.close_time}`
                     : 'Contact for hours'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {practicalInfo.customs_info.contact_info}
                </p>
                {practicalInfo.customs_info.notes.length > 0 && (
                  <div className="space-y-1">
                    {practicalInfo.customs_info.notes.map((note, index) => (
                      <p key={index} className="text-xs text-muted-foreground">• {note}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Immigration */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Immigration Office
              </h4>
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">Office Hours</p>
                <p className="text-sm font-medium">
                  {practicalInfo.immigration_info.office_hours.is_closed ? 'Closed' :
                   practicalInfo.immigration_info.office_hours.open_time && practicalInfo.immigration_info.office_hours.close_time
                     ? `${practicalInfo.immigration_info.office_hours.open_time} - ${practicalInfo.immigration_info.office_hours.close_time}`
                     : 'Contact for hours'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {practicalInfo.immigration_info.contact_info}
                </p>
                {practicalInfo.immigration_info.notes.length > 0 && (
                  <div className="space-y-1">
                    {practicalInfo.immigration_info.notes.map((note, index) => (
                      <p key={index} className="text-xs text-muted-foreground">• {note}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Safety Information */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Safety Information
              </h4>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Crime Level:</span>
                  <Badge 
                    variant="outline"
                    className={cn(
                      'text-xs',
                      practicalInfo.safety_info.crime_level === 'low' && 'border-green-300 text-green-700',
                      practicalInfo.safety_info.crime_level === 'moderate' && 'border-yellow-300 text-yellow-700',
                      practicalInfo.safety_info.crime_level === 'high' && 'border-red-300 text-red-700'
                    )}
                  >
                    {practicalInfo.safety_info.crime_level.toUpperCase()}
                  </Badge>
                </div>
                
                {practicalInfo.safety_info.safety_tips.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-900">Safety Tips:</p>
                    {practicalInfo.safety_info.safety_tips.map((tip, index) => (
                      <p key={index} className="text-xs text-yellow-800">• {tip}</p>
                    ))}
                  </div>
                )}
                
                {practicalInfo.safety_info.restricted_areas.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-900">Restricted Areas:</p>
                    {practicalInfo.safety_info.restricted_areas.map((area, index) => (
                      <p key={index} className="text-xs text-yellow-800">• {area}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FacilitySection({
  title,
  icon: Icon,
  facilities
}: {
  title: string;
  icon: any;
  facilities: any[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{title}</span>
      </div>
      
      <div className="space-y-2">
        {facilities.slice(0, 5).map((facility, index) => (
          <div key={index} className="p-2 border rounded">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{facility.name}</p>
                <p className="text-xs text-muted-foreground">{facility.address}</p>
                {facility.hours && (
                  <p className="text-xs text-muted-foreground">{facility.hours}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {facility.distance_from_port} from port
                </p>
              </div>
              {facility.phone && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`tel:${facility.phone}`, '_self')}
                  className="text-xs h-6 px-2"
                >
                  Call
                </Button>
              )}
            </div>
            {facility.notes && (
              <p className="text-xs text-muted-foreground mt-1">{facility.notes}</p>
            )}
          </div>
        ))}
        
        {facilities.length > 5 && (
          <p className="text-xs text-muted-foreground text-center">
            +{facilities.length - 5} more {title.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}
