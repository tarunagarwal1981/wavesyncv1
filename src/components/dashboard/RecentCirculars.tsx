import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  ExternalLink,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import type { Circular } from '@/types/dashboard';

interface RecentCircularsProps {
  circulars: Array<Circular & { is_read: boolean }>;
  isLoading?: boolean;
}

export function RecentCirculars({ circulars, isLoading }: RecentCircularsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse bg-muted h-6 w-40 rounded"></div>
          <div className="animate-pulse bg-muted h-4 w-44 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="animate-pulse bg-muted h-4 w-full max-w-36 rounded"></div>
              <div className="animate-pulse bg-muted h-3 w-full max-w-48 rounded"></div>
              <div className="animate-pulse bg-muted h-3 w-24 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (circulars.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Circulars
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Company communications and updates
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Recent Circulars</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            No company communications at the moment.
          </p>
          <Button variant="outline" size="sm">
            View All Circulars
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getPriorityIcon = (priority: Circular['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CircleDot className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: Circular['priority']) => {
    const variants = {
      urgent: 'destructive' as const,
      high: 'default' as const,
      medium: 'secondary' as const,
      low: 'outline' as const,
    };
    return <Badge variant={variants[priority]} className="text-xs">{priority}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = circulars.filter(c => !c.is_read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Circulars
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Company communications and updates
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {circulars.map((circular) => (
          <div
            key={circular.id}
            className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
              circular.is_read 
                ? 'bg-card border-border' 
                : 'bg-primary/5 border-primary/20'
            }`}
            onClick={() => {
              // In a real app, navigate to circular details
              console.log(`View circular: \({circular.id}`);
            }}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {getPriorityIcon(circular.priority)}
                  <h4 className={`font-medium text-sm leading-tight flex-1 ${
                    !circular.is_read ? 'font-semibold' : ''
                  }`}>
                    {circular.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {!circular.is_read && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                  {getPriorityBadge(circular.priority)}
                </div>
              </div>

              {/* Content Preview */}
              <p className={`text-xs leading-relaxed line-clamp-2 ${
                circular.is_read ? 'text-muted-foreground' : 'text-foreground'
              }`}>
                {circular.content.length > 100 
                  ? `${circular.content.substring(0, 100)}...` 
                  : circular.content
                }
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(circular.created_at)}</span>
                  <span>•</span>
                  <span>{circular.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  {circular.is_read ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                  <span>{circular.is_read ? 'Read' : 'Unread'}</span>
                </div>
              </div>

              {/* Reference Number */}
              {circular.reference_number && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    Reference: {circular.reference_number}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* View All Button */}
        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full">
            View All Circulars
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CircularPreview({ 
  circular, 
  isRead = false 
}: { 
  circular: Circular; 
  isRead?: boolean; 
}) {
  const getPriorityColor = (priority: Circular['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getPriorityColor(circular.priority)}`}>
      <div className="flex items-start gap-2">
        <div className={`w-1 h-full rounded-full ${
          !isRead ? 'bg-primary' : 'bg-muted-foreground'
        }`}></div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium mb-1 ${!isRead ? 'font-semibold' : ''}`}>
            {circular.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {circular.content.substring(0, 80)}...
          </p>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="text-xs">
              {circular.priority}
            </Badge>
            <span className="text-muted-foreground">
              {new Date(circular.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


