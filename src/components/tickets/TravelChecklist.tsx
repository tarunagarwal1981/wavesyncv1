import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  FileText,
  Clipboard,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TicketDetails, TravelDocument } from '@/lib/tickets/types';
import { getRequiredDocuments } from '@/lib/tickets/utils';

interface TravelChecklistProps {
  ticket: TicketDetails;
  className?: string;
}

export function TravelChecklist({ ticket, className }: TravelChecklistProps) {
  const requiredDocuments = getRequiredDocuments(ticket);
  const completedCount = requiredDocuments.filter(doc => doc.is_valid).length;
  const totalCount = requiredDocuments.length;

  const getDocumentIcon = (type: TravelDocument['type']) => {
    switch (type) {
      case 'passport': return '🛂';
      case 'seaman_book': return '📘';
      case 'visa': return '🎫';
      case 'medical_certificate': return '🏥';
      case 'yellow_fever': return '💉';
      default: return '📄';
    }
  };

  const getDocumentStatus = (doc: TravelDocument) => {
    if (!doc.is_required) {
      return { text: 'Optional', color: 'text-gray-500', icon: Circle };
    }
    if (doc.is_valid) {
      return { text: 'Valid', color: 'text-green-600', icon: CheckCircle };
    }
    if (doc.expiry_date) {
      const expiryDate = new Date(doc.expiry_date);
      const isNearExpiry = expiryDate.getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
      if (isNearExpiry) {
        return { text: 'Expiring Soon', color: 'text-orange-600', icon: AlertTriangle };
      }
      return { text: 'Invalid/Expired', color: 'text-red-600', icon: AlertTriangle };
    }
    return { text: 'Not Verified', color: 'text-yellow-600', icon: AlertTriangle };
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-primary" />
            Travel Documents Checklist
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {completedCount}/{totalCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedCount / totalCount) * 100)}% Complete
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              completedCount === totalCount ? 'bg-green-500' : 
              completedCount >= totalCount * 0.7 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Documents List */}
        <div className="space-y-3">
          {requiredDocuments.map((doc, index) => {
            const status = getDocumentStatus(doc);
            const IconComponent = status.icon;
            
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getDocumentIcon(doc.type)}</span>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    {doc.number && (
                      <p className="text-xs text-muted-foreground font-mono">
                        #{doc.number}
                      </p>
                    )}
                    {doc.expiry_date && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={cn('flex items-center gap-1', status.color)}>
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{status.text}</span>
                  </div>
                  
                  {doc.is_required && !doc.is_valid && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Items */}
        {completedCount < totalCount && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-medium text-orange-900">
                  Action Required
                </p>
                <p className="text-sm text-orange-800">
                  You have {totalCount - completedCount} missing or expired documents 
                  that may be required for your travel.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-orange-700 border-orange-300">
                    <FileText className="h-3 w-3 mr-1" />
                    View Requirements
                  </Button>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Clock className="h-3 w-2 mr-1" />
                    Update Documents
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Travel Tips */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Travel Tips</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• Keep digital copies of all documents on your phone</p>
            <p>• Pack documents in carry-on luggage for easy access</p>
            <p>• Check visa validity matches your stay duration</p>
            <p>• Medical certificates should be in English or destination language</p>
          </div>
        </div>

        {/* Travel Purpose Specific */}
        {ticket.travel_purpose === 'joining' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Joining Assignment</h4>
            <div className="space-y-1 text-sm text-green-800">
              <p>• Ensure work visa is valid for entire assignment duration</p>
              <p>• Check if seaman's book has sufficient pages for stamps</p>
              <p>• Medical certificate should be recent (within 6 months)</p>
            </div>
          </div>
        )}

        {ticket.travel_purpose === 'signoff' && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Sign-off Travel</h4>
            <div className="space-y-1 text-sm text-purple-800">
              <p>• Passport should be valid for return travel</p>
              <p>• Check transit visa requirements for connecting flights</p>
              <p>• Consider extended medical coverage post-assignment</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



