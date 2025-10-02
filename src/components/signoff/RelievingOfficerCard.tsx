'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RelievingOfficer } from '@/lib/signoff/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  FileText,
  MessageSquare 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RelievingOfficerCardProps {
  relievingOfficer?: RelievingOfficer;
  onContact?: () => void;
}

export function RelievingOfficerCard({ relievingOfficer, onContact }: RelievingOfficerCardProps) {
  if (!relievingOfficer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Relieving Officer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="font-semibold text-gray-600 mb-2">
              Relieving Officer Not Assigned
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Your relieving officer information will appear here once assigned.
            </p>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact HR for Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatJoiningDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const daysFromNow = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysFromNow < 0) {
      return `Joined ${Math.abs(daysFromNow)} days ago`;
    } else if (daysFromNow === 0) {
      return 'Joining today';
    } else {
      return `Joining in ${daysFromNow} days`;
    }
  };

  const joiningDate = new Date(relievingOfficer.joiningDate);
  const isJoiningSoon = joiningDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <Card className={isJoiningSoon ? 'border-blue-200 bg-blue-50/30' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Relieving Officer
          </div>
          {isJoiningSoon && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Joining Soon
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Officer Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {relievingOfficer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {relievingOfficer.name}
              </h3>
              <p className="text-blue-700 font-medium">
                {relievingOfficer.rank}
              </p>
              
              {relievingOfficer.previousVessel && (
                <p className="text-sm text-gray-600 mt-1">
                  Previously on {relievingOfficer.previousVessel}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <a 
              href={`mailto:${relievingOfficer.email}`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {relievingOfficer.email}
            </a>
          </div>

          {relievingOfficer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <a 
                href={`tel:${relievingOfficer.phone}`}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {relievingOfficer.phone}
              </a>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              {formatJoiningDate(relievingOfficer.joiningDate)}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {new Date(relievingOfficer.joiningDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        {relievingOfficer.notes && (
          <div className="border-t pt-3">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                <p className="text-sm text-gray-600">{relievingOfficer.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={onContact}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Officer
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.print()}
          >
            <FileText className="h-4 w-4 mr-2" />
            Print Details
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-3">
          <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              Email Introduction
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              Schedule Briefing
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
