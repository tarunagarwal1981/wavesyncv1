import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from './PriorityBadge';
import { CircularWithStatus, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/circulars/types';
import { Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface CircularCardProps {
  circular: CircularWithStatus;
}

export function CircularCard({ circular }: CircularCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      const diffInHoursFormatted = Math.floor(diffInHours);
      return `${diffInHoursFormatted} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getPreviewText = (content: string) => {
    const cleanText = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return cleanText.length > 150 ? `${cleanText.substring(0, 150)}...` : cleanText;
  };

  return (
    <Link href={`/circulars/${circular.id}`} className="block">
      <Card className={`hover:shadow-md transition-shadow ${!circular.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2">
                <span className={!circular.isRead ? 'font-semibold' : ''}>
                  {circular.title}
                </span>
                {circular.requiresAcknowledgment && !circular.isAcknowledged && (
                  <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                )}
                {circular.isRead && (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="text-sm">
                  {circular.referenceNumber && `Ref: ${circular.referenceNumber} • `}
                  by {circular.publisherName}
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <PriorityBadge priority={circular.priority} />
              <Badge 
                variant="secondary" 
                className={`${CATEGORY_COLORS[circular.category]}`}
              >
                {CATEGORY_LABELS[circular.category]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {getPreviewText(circular.content)}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(circular.issueDate)}
              </div>
              {circular.attachments && circular.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {circular.attachments.length} attachment{circular.attachments.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            {circular.isAcknowledged && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Acknowledged
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}



