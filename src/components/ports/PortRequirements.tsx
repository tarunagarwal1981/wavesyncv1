'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  FileText, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Download,
  Users,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortRequirements } from '@/lib/ports/types';

interface PortRequirementsProps {
  requirements: PortRequirements;
  className?: string;
}

export function PortRequirements({ requirements, className }: PortRequirementsProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Port Requirements & Clearance
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Health Requirements */}
        <div className="space-y-3">
          <h4 className="font-medium text-lg flex items-center gap-2">
            <Users className="h-4 w-4" />
            Health Requirements
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {requirements.health_requirements.yellow_fever_certificate ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">Yellow Fever Certificate</span>
              </div>
              <Badge 
                variant="outline"
                className={cn(
                  'text-xs',
                  requirements.health_requirements.yellow_fever_certificate 
                    ? 'border-green-300 text-green-700' 
                    : 'border-red-300 text-red-700'
                )}
              >
                {requirements.health_requirements.yellow_fever_certificate ? 'Required' : 'Not Required'}
              </Badge>
            </div>
            
            {requirements.health_requirements.other_vaccinations.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Other Required Vaccinations:</p>
                <div className="space-y-1">
                  {requirements.health_requirements.other_vaccinations.map((vaccine, index) => (
                    <p key={index} className="text-sm text-muted-foreground">• {vaccine}</p>
                  ))}
                </div>
              </div>
            )}
            
            {requirements.health_requirements.covid_quarantine && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-900 text-sm mb-1">COVID-19 Quarantine Requirements</p>
                    <p className="text-yellow-800 text-sm">{requirements.health_requirements.covid_quarantine}</p>
                  </div>
                </div>
              </div>
            )}
            
            {requirements.health_requirements.medical_check && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Medical Check Required</p>
                <p className="text-blue-800 text-sm">{requirements.health_requirements.medical_check}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documentation Requirements */}
        <div className="space-y-3">
          <h4 className="font-medium text-lg flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentation Requirements
          </h4>
          
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Passport Validity</p>
              <p className="text-sm text-muted-foreground">{requirements.documentation_requirements.passport_validity}</p>
            </div>
            
            {requirements.documentation_requirements.visa_requirements.length > 0 && (
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-2">Visa Requirements</p>
                <div className="space-y-1">
                  {requirements.documentation_requirements.visa_requirements.map((requirement, index) => (
                    <p key={index} className="text-sm text-muted-foreground">• {requirement}</p>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Seaman's Book</p>
              <p className="text-sm text-muted-foreground">{requirements.documentation_requirements.seaman_book_stamps}</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Crew List Updates</p>
              <p className="text-sm text-muted-foreground">{requirements.documentation_requirements.crew_list_updates}</p>
            </div>
          </div>
        </div>

        {/* Port Clearance */}
        <div className="space-y-3">
          <h4 className="font-medium text-lg flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Port Clearance Procedures
          </h4>
          
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Advance Notice Period</p>
              <p className="text-sm text-muted-foreground">{requirements.port_clearance.arrival_notice_period}</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Customs Declaration</p>
              <p className="text-sm text-muted-foreground">{requirements.port_clearance.customs_declaration}</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Agent Appointment</span>
                <Badge 
                  variant="outline"
                  className={cn(
                    'text-xs',
                    requirements.port_clearance.agent_appointment 
                      ? 'border-green-300 text-green-700' 
                      : 'border-red-300 text-red-700'
                  )}
                >
                  {requirements.port_clearance.agent_appointment ? 'Required' : 'Optional'}
                </Badge>
              </div>
            </div>
            
            {requirements.port_clearance.required_fees.length > 0 && (
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-2">Required Fees</p>
                <div className="space-y-2">
                  {requirements.port_clearance.required_fees.map((fee, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{fee.service}</p>
                        {fee.notes && (
                          <p className="text-xs text-muted-foreground">{fee.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {fee.required ? `${fee.amount} ${fee.currency}` : 'Optional'}
                        </p>
                        {fee.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Requirements */}
        <div className="space-y-3">
          <h4 className="font-medium text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Requirements
          </h4>
          
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Cargo Requirements</p>
              <div className="space-y-1">
                {requirements.security_requirements.cargo_requirements.map((requirement, index) => (
                  <p key={index} className="text-sm text-muted-foreground">• {requirement}</p>
                ))}
              </div>
            </div>
            
            {requirements.security_requirements.dangerous_goods.length > 0 && (
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-2">Dangerous Goods Handling</p>
                <div className="space-y-1">
                  {requirements.security_requirements.dangerous_goods.map((requirement, index) => (
                    <p key={index} className="text-sm text-muted-foreground">• {requirement}</p>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Passenger Screening</p>
              <p className="text-sm text-muted-foreground">{requirements.security_requirements.passenger_screenings}</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Crew Identification</p>
              <p className="text-sm text-muted-foreground">{requirements.security_requirements.crew_identification}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Checklist
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              View Forms
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
